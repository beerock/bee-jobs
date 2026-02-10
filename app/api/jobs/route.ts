import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

// Create admin client for API access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Constant-time string comparison to prevent timing attacks
function secureCompare(a: string | null | undefined, b: string | undefined): boolean {
  if (!a || !b) return false
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

// Whitelist of fields allowed in PATCH updates
const ALLOWED_UPDATE_FIELDS = [
  'company', 'role', 'company_stage', 'company_size', 'company_mission',
  'job_url', 'careers_url', 'website', 'location', 'salary_range',
  'why_good_fit', 'status', 'notes', 'interested', 'applied_at',
]

// Validate that a URL uses http/https protocol
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Sanitize database errors to avoid leaking internals
function sanitizeDbError(error: { code?: string; message?: string }): string {
  console.error('Database error:', error)
  if (error.code === '23505') return 'Duplicate entry'
  if (error.code === '23503') return 'Invalid reference'
  return 'An error occurred while processing your request'
}

// Authenticate request and return the user, or an error response
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (!secureCompare(apiKey, process.env.BEEBOT_API_KEY)) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users?.[0]

  if (!user) {
    return { error: NextResponse.json({ error: 'No user found' }, { status: 400 }) }
  }

  return { user }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.company || typeof body.company !== 'string' || body.company.trim().length === 0 || body.company.length > 500) {
      return NextResponse.json({ error: 'Invalid or missing company name' }, { status: 400 })
    }
    if (!body.role || typeof body.role !== 'string' || body.role.trim().length === 0 || body.role.length > 500) {
      return NextResponse.json({ error: 'Invalid or missing role' }, { status: 400 })
    }

    // Validate URL fields
    const urlFields = ['job_url', 'website', 'careers_url'] as const
    for (const field of urlFields) {
      if (body[field] && !isValidUrl(body[field])) {
        return NextResponse.json({ error: `Invalid ${field} format (must be http/https)` }, { status: 400 })
      }
    }

    const { data, error } = await supabaseAdmin.from('jobs').insert({
      user_id: auth.user.id,
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
      return NextResponse.json({ error: sanitizeDbError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true, job: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: sanitizeDbError(error) }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Whitelist allowed fields
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in body) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Validate URL fields if present
    const urlFields = ['job_url', 'website', 'careers_url'] as const
    for (const field of urlFields) {
      if (updates[field] && typeof updates[field] === 'string' && !isValidUrl(updates[field] as string)) {
        return NextResponse.json({ error: `Invalid ${field} format (must be http/https)` }, { status: 400 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: sanitizeDbError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true, job: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: sanitizeDbError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
