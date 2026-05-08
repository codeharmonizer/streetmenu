import { redirect } from 'next/navigation'
import VendorSettings from '@/components/vendor/VendorSettings'
import { getVendor } from '@/lib/data'

export default async function SettingsPage() {
  const vendor = await getVendor()
  if (!vendor) redirect('/login')
  return <VendorSettings vendor={vendor} />
}
