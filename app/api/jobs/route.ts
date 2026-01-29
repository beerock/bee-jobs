import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client for API access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (!apiKey || apiKey !== process.env.BEEBOT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Get the user (assuming single user for now - you can make this configurable)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.users?.[0]

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 })
    }

    // Insert the job
    const { data, error } = await supabaseAdmin.from('jobs').insert({
      user_id: user.id,
      company: body.company,
      role: body.role,
      company_stage: body.stage || body.company_stage,
      company_size: body.size || body.company_size,
      company_mission: body.mission || body.company_mission,
      website: body.website,
      careers_url: body.careers_url,
      job_url: body.job_url,
      location: body.location,
      salary_range: body.salary_range,
      why_good_fit: body.why_good_fit,
      notes: body.notes,
      source: 'beebot',
    }).select().single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, job: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (!apiKey || apiKey !== process.env.BEEBOT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.users?.[0]

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 })
    }

    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
