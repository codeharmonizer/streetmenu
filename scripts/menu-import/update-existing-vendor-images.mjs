#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const IMAGE_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try { process.loadEnvFile(file) } catch {}
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return { url, key }
}

async function loadImage(source, specDir) {
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`)
    const type = (res.headers.get('content-type') || '').split(';')[0]
    const ext = Object.entries(IMAGE_TYPES).find(([, t]) => t === type)?.[0]
    if (!ext) throw new Error(`${source}: unsupported content type ${type || 'unknown'}`)
    const bytes = Buffer.from(await res.arrayBuffer())
    if (bytes.length > MAX_IMAGE_BYTES) throw new Error(`${source}: image larger than 5 MB`)
    return { bytes, type, ext }
  }
  const file = path.resolve(specDir, source)
  const ext = path.extname(file).slice(1).toLowerCase()
  if (!IMAGE_TYPES[ext]) throw new Error(`${source}: unsupported file type .${ext}`)
  const bytes = await readFile(file)
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error(`${source}: image larger than 5 MB`)
  return { bytes, type: IMAGE_TYPES[ext], ext }
}

async function uploadImage(supabase, vendorId, source, specDir, prefix) {
  const { bytes, type, ext } = await loadImage(source, specDir)
  const objectPath = `${vendorId}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from('menu-photos').upload(objectPath, bytes, { contentType: type, upsert: false })
  if (error) throw new Error(error.message)
  return supabase.storage.from('menu-photos').getPublicUrl(objectPath).data.publicUrl
}

async function getVendor(supabase, slug) {
  const { data, error } = await supabase.from('vendors').select('id, slug, name').eq('slug', slug).single()
  if (error) throw new Error(`Vendor ${slug}: ${error.message}`)
  return data
}

async function updateLogo(supabase, slug, logoSource, specDir) {
  const vendor = await getVendor(supabase, slug)
  const logoUrl = await uploadImage(supabase, vendor.id, logoSource, specDir, 'logo')
  const { error } = await supabase.from('vendors').update({ logo_url: logoUrl }).eq('id', vendor.id)
  if (error) throw new Error(`Logo update ${slug}: ${error.message}`)
  console.log(`logo ${slug} -> ${logoUrl}`)
}

async function updateItemPhotos(supabase, slug, specPath) {
  const specDir = path.dirname(specPath)
  const spec = JSON.parse(await readFile(specPath, 'utf8'))
  const vendor = await getVendor(supabase, slug)
  const { data: rows, error } = await supabase.from('menu_items').select('id, name').eq('vendor_id', vendor.id)
  if (error) throw new Error(`Items ${slug}: ${error.message}`)
  const byName = new Map((rows ?? []).map(row => [row.name, row]))
  let updated = 0
  for (const item of spec.items) {
    if (!item.photo) continue
    const row = byName.get(item.name)
    if (!row) throw new Error(`Missing item in ${slug}: ${item.name}`)
    const photoUrl = await uploadImage(supabase, vendor.id, item.photo, specDir, 'item')
    const { error: updateError } = await supabase.from('menu_items').update({ photo_url: photoUrl }).eq('id', row.id)
    if (updateError) throw new Error(`Photo update ${item.name}: ${updateError.message}`)
    updated++
  }
  console.log(`items ${slug} -> ${updated} photos`)
}

async function main() {
  const env = loadEnv()
  const supabase = createClient(env.url, env.key, { auth: { persistSession: false } })
  await updateItemPhotos(supabase, 'the-k-food-truck', 'menus/the-k-food-truck.json')
  await updateLogo(supabase, 'the-k-food-truck', JSON.parse(await readFile('menus/the-k-food-truck.json', 'utf8')).vendor.logo, 'menus')
  await updateLogo(supabase, 'kafchaa', JSON.parse(await readFile('menus/kafchaa.json', 'utf8')).vendor.logo, 'menus')
  console.log('done')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
