#!/usr/bin/env node
// Create an admin-managed vendor + menu from a JSON spec (see scripts/menu-import/README.md).
//
//   node scripts/menu-import/import.mjs menus/karak-house.json --dry-run
//   node scripts/menu-import/import.mjs menus/karak-house.json --trial-days 90
//
// Reads NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_APP_URL from .env.local.

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { buildImportPlan, outreachMessage } from './lib.mjs'

const IMAGE_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function parseArgs(argv) {
  const args = { file: null, dryRun: false, trialDays: 0, adminId: process.env.RELAXED_MENU_ADMIN_ID || null, noPhotos: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--no-photos') args.noPhotos = true
    else if (arg === '--trial-days') args.trialDays = Number(argv[++i])
    else if (arg === '--admin-id') args.adminId = argv[++i]
    else if (arg === '--help' || arg === '-h') args.help = true
    else if (!arg.startsWith('--')) args.file = arg
    else throw new Error(`Unknown option ${arg}`)
  }
  if (!Number.isInteger(args.trialDays) || args.trialDays < 0 || args.trialDays > 366) {
    throw new Error('--trial-days must be a whole number between 0 and 366')
  }
  return args
}

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try { process.loadEnvFile(file) } catch { /* optional */ }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run from the repo root with .env.local present)')
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://relaxedmenu.beyounded.com').replace(/\/+$/, '')
  return { url, key, appUrl }
}

async function availableValue(supabase, column, base, separator) {
  const { data, error } = await supabase.from('vendors').select(column).ilike(column, `${base}%`)
  if (error) throw new Error(error.message)
  const taken = new Set((data ?? []).map(row => String(row[column]).toLowerCase()))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}${separator}${n}`)) n++
  return `${base}${separator}${n}`
}

async function resolveAdminId(supabase, explicit) {
  if (explicit) return explicit
  const { data } = await supabase.from('admins').select('user_id').limit(2)
  return data?.length === 1 ? data[0].user_id : null
}

async function loadImage(source, specDir) {
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const type = (res.headers.get('content-type') || '').split(';')[0]
    const ext = Object.entries(IMAGE_TYPES).find(([, t]) => t === type)?.[0]
    if (!ext) throw new Error(`unsupported content type ${type || 'unknown'}`)
    return { bytes: Buffer.from(await res.arrayBuffer()), type, ext }
  }
  const file = path.resolve(specDir, source)
  const ext = path.extname(file).slice(1).toLowerCase()
  if (!IMAGE_TYPES[ext]) throw new Error(`unsupported file type .${ext}`)
  return { bytes: await readFile(file), type: IMAGE_TYPES[ext], ext }
}

async function uploadImage(supabase, vendorId, source, specDir, prefix) {
  const { bytes, type, ext } = await loadImage(source, specDir)
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error('image is larger than 5 MB')
  const objectPath = `${vendorId}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from('menu-photos').upload(objectPath, bytes, { contentType: type, upsert: false })
  if (error) throw new Error(error.message)
  return supabase.storage.from('menu-photos').getPublicUrl(objectPath).data.publicUrl
}

function printPlan(plan, trialDays) {
  const v = plan.vendor
  console.log(`\nVendor   ${v.name}`)
  console.log(`Link     /m/${v.slug}   (username: ${v.username})`)
  if (v.category) console.log(`Category ${v.category}`)
  if (v.phone) console.log(`WhatsApp ${v.phone}`)
  console.log(`Plan     ${trialDays ? `Pro trial for ${trialDays} days` : 'Free'}`)
  console.log(`\nItems (${plan.items.length}${plan.skipped ? `, ${plan.skipped} skipped` : ''})`)
  let lastCategory
  for (const item of plan.items) {
    if (item.category !== lastCategory) { console.log(`  ${item.category ?? '(no category)'}`); lastCategory = item.category }
    console.log(`    ${item.price.toFixed(3).padStart(8)} BD  ${item.name}${item.photo ? '  📷' : ''}${item.available ? '' : '  (sold out)'}`)
  }
  for (const w of plan.warnings) console.log(`\n⚠️  ${w}`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || !args.file) {
    console.log('Usage: node scripts/menu-import/import.mjs <menu.json> [--dry-run] [--trial-days N] [--no-photos] [--admin-id UUID]')
    process.exit(args.help ? 0 : 1)
  }

  const specPath = path.resolve(args.file)
  const spec = JSON.parse(await readFile(specPath, 'utf8'))
  const plan = buildImportPlan(spec, { itemLimit: args.trialDays > 0 ? Infinity : undefined })
  printPlan(plan, args.trialDays)

  if (args.dryRun) {
    console.log('\nDry run: nothing was written. Re-run without --dry-run to create the menu.')
    return
  }

  const env = loadEnv()
  const supabase = createClient(env.url, env.key, { auth: { persistSession: false } })

  const slug = await availableValue(supabase, 'slug', plan.vendor.slug, '-')
  const username = await availableValue(supabase, 'username', plan.vendor.username, '')
  if (slug !== plan.vendor.slug) console.log(`\nLink /m/${plan.vendor.slug} is taken, using /m/${slug}`)
  const adminId = await resolveAdminId(supabase, args.adminId)
  const now = new Date()

  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .insert({
      user_id: null,
      name: plan.vendor.name,
      slug,
      username,
      description: plan.vendor.description,
      category: plan.vendor.category,
      address: plan.vendor.address,
      phone: plan.vendor.phone,
      hours: plan.vendor.hours,
      vendor_status: 'managed',
      is_active: true,
      created_by_admin_id: adminId,
      updated_by_admin_id: adminId,
      last_admin_action_at: now.toISOString(),
      ...(args.trialDays > 0 ? {
        subscription_status: 'trial',
        subscription_starts_at: now.toISOString(),
        subscription_expires_at: new Date(now.getTime() + args.trialDays * 86_400_000).toISOString(),
      } : {}),
    })
    .select('id, slug')
    .single()
  if (vendorError) throw new Error(`Could not create vendor: ${vendorError.message}`)

  try {
    const photoFailures = []
    const specDir = path.dirname(specPath)

    if (plan.vendor.logo && !args.noPhotos) {
      try {
        const logoUrl = await uploadImage(supabase, vendor.id, plan.vendor.logo, specDir, 'logo')
        await supabase.from('vendors').update({ logo_url: logoUrl }).eq('id', vendor.id)
      } catch (error) { photoFailures.push(`logo: ${error.message}`) }
    }

    const rows = []
    for (const item of plan.items) {
      let photoUrl = null
      if (item.photo && !args.noPhotos) {
        try { photoUrl = await uploadImage(supabase, vendor.id, item.photo, specDir, 'item') }
        catch (error) { photoFailures.push(`${item.name}: ${error.message}`) }
      }
      rows.push({
        vendor_id: vendor.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        photo_url: photoUrl,
        available: item.available,
        sort_order: item.sort_order,
      })
    }

    const { error: itemsError } = await supabase.from('menu_items').insert(rows)
    if (itemsError) throw new Error(`Could not insert menu items: ${itemsError.message}`)

    const url = `${env.appUrl}/m/${vendor.slug}`
    const result = {
      vendorId: vendor.id,
      name: plan.vendor.name,
      url,
      adminUrl: `${env.appUrl}/admin/vendors/${vendor.id}/menu`,
      items: rows.length,
      trialDays: args.trialDays,
      photoFailures,
      messageAr: outreachMessage({ vendorName: plan.vendor.name, url, language: 'ar' }),
      messageEn: outreachMessage({ vendorName: plan.vendor.name, url, language: 'en' }),
    }
    await writeFile(specPath.replace(/\.json$/i, '') + '.result.json', JSON.stringify(result, null, 2))

    console.log(`\n✅ Menu live: ${url}`)
    console.log(`   Edit in admin: ${result.adminUrl}`)
    for (const f of photoFailures) console.log(`   ⚠️  Photo skipped — ${f}`)
    console.log(`\n--- Message to send (Arabic) ---\n${result.messageAr}\n`)
  } catch (error) {
    // Don't leave a half-built vendor (or its uploaded photos) behind.
    const { data: uploaded } = await supabase.storage.from('menu-photos').list(vendor.id)
    if (uploaded?.length) await supabase.storage.from('menu-photos').remove(uploaded.map(o => `${vendor.id}/${o.name}`))
    await supabase.from('vendors').delete().eq('id', vendor.id)
    throw error
  }
}

main().catch(error => {
  console.error(`\n❌ ${error.message}`)
  process.exit(1)
})
