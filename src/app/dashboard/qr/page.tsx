import { redirect } from 'next/navigation'
import QRDisplay from '@/components/vendor/QRDisplay'
import { getVendor } from '@/lib/data'

export default async function QRPage() {
  const vendor = await getVendor()
  if (!vendor) redirect('/login')

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/m/${vendor.slug}`

  return <QRDisplay vendor={vendor} menuUrl={menuUrl} />
}
