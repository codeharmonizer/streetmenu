# Relaxed Menu 🍢

QR-powered digital menus for street vendors, food trucks, and home kitchens.

---

## Quick Start (5 steps)

### Step 1 — Install dependencies

Open Terminal, navigate to this folder, and run:

```bash
cd relaxedmenu
npm install
```

---

### Step 2 — Create your Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New project"**, give it a name (e.g. `relaxedmenu`), set a database password
3. Wait ~1 minute for it to provision
4. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

---

### Step 3 — Set up your database

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from this folder
4. Paste the entire contents into the SQL editor
5. Click **Run** — you should see "Success"

---

### Step 4 — Configure environment variables

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Open `.env.local` in any text editor and fill in your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 5 — Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your app is live! 🎉

---

## Deploy to Vercel (free)

### Create a Vercel account
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Push your code to a GitHub repo first:

```bash
git init
git add .
git commit -m "Initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/relaxedmenu.git
git push -u origin main
```

### Deploy
1. On Vercel, click **"Add New Project"**
2. Import your GitHub repo
3. In **Environment Variables**, add the same 3 variables from your `.env.local`
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://relaxedmenu.vercel.app`)
5. Click **Deploy** — done in ~2 minutes!

---

## Features

- **Vendor dashboard** — manage menu, view analytics, download QR code
- **Public menu page** — beautiful mobile menu at `/m/[slug]`
- **QR code** — auto-generated, downloadable as PNG
- **Analytics** — track daily scans over 30 days
- **Reviews** — customers can leave star ratings
- **Sold-out toggle** — mark items unavailable in real time
- **Settings** — update stall info, hours, phone, open/closed status

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    login/page.tsx        # Sign in
    register/page.tsx     # Sign up + vendor setup
    dashboard/
      page.tsx            # Overview
      menu/page.tsx       # Menu management
      qr/page.tsx         # QR code
      analytics/page.tsx  # Scan analytics
      settings/page.tsx   # Vendor settings
    m/[slug]/page.tsx     # Public menu (customer view)
  components/
    shared/               # Sidebar, nav
    menu/                 # Menu manager, review form
    vendor/               # QR display, settings
  lib/
    supabase/             # Browser + server clients
    utils.ts              # Helpers
  types/index.ts          # TypeScript types
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database + Auth + Storage**: Supabase
- **QR Codes**: qrcode.react
- **Deployment**: Vercel

---

Built with ❤️ for street food vendors.
