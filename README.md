# 🐝 bee-jobs

Personal job tracking CRM - find, track, and manage job opportunities.

## Features

- **Kanban Board** - Drag-and-drop job cards through stages: Saved → Applied → Interviewing → Offer → Passed
- **Rich Job Details** - Company info, role, stage, size, mission, URLs, salary range
- **AI-Powered** - BeeBot finds and adds jobs with "why it fits" reasoning
- **Contact Tracking** - Track people you know at each company
- **Notes & Activity** - Keep notes and see timeline of activity
- **Filtering & Search** - Filter by status, company stage, date added
- **Secure** - Password auth via Supabase, private to you

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - Database + Authentication
- **Tailwind CSS** - Styling
- **dnd-kit** - Drag and drop
- **Vercel** - Deployment

## Setup

### 1. Clone and install

```bash
git clone https://github.com/beerock/bee-jobs.git
cd bee-jobs
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings → API and copy your project URL and anon key
3. Create `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Set up database

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Configure auth

1. Go to Authentication → Providers
2. Enable Email provider with "Confirm email" disabled (for simplicity)
3. Create your user account

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel (optional)

```bash
vercel
```

Add your environment variables in Vercel dashboard.

## API Endpoint

BeeBot can push jobs via the API:

```bash
POST /api/jobs
Authorization: Bearer YOUR_BEEBOT_API_KEY
Content-Type: application/json

{
  "company": "Acme Corp",
  "role": "VP of Product",
  "stage": "Series B",
  "size": "150 employees",
  "mission": "Making widgets better",
  "website": "https://acme.com",
  "careers_url": "https://acme.com/careers",
  "job_url": "https://acme.com/careers/vp-product",
  "salary_range": "$180k-$220k",
  "location": "Remote",
  "why_good_fit": "EdTech adjacent, product-led growth, values match",
  "notes": ""
}
```

## License

Private - Brock Busby
