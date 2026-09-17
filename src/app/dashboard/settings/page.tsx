import { redirect } from 'next/navigation'
import VendorSettings from '@/components/vendor/VendorSettings'
import { getUser, getVendor } from '@/lib/data'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const vendor = await getVendor()
  if (!vendor) redirect('/login')
  return <VendorSettings vendor={vendor} userEmail={user.email ?? null} />
}
