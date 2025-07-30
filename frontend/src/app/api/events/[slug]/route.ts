import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const { data, error } = await supabaseAdmin
      .from('events')
      .select(
        `
        *,
        markets(
          condition_id,
          name,
          slug,
          description,
          short_title,
          outcome_count,
          icon_url,
          is_active,
          is_resolved,
          current_volume_24h,
          total_volume,
          open_interest
        ),
        event_tags(
          tag:tags(
            id,
            name,
            slug,
            is_main_category
          )
        )
      `,
      )
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    console.log(`[API] Successfully found event: ${data?.title}`)

    // Fetch outcomes for each market
    const marketsWithOutcomes = []

    if (data.markets) {
      for (const market of data.markets) {
        // Fetch outcomes for this market
        const { data: outcomes } = await supabaseAdmin
          .from('outcomes')
          .select('*')
          .eq('condition_id', market.condition_id)
          .order('outcome_index')

        marketsWithOutcomes.push({
          ...market,
          outcomes: outcomes || [],
        })
      }
    }

    // Transformar dados para formato esperado
    const transformedData = {
      ...data,
      tags:
        data.event_tags
          ?.map((et: { tag: unknown }) => et.tag)
          .filter(Boolean) || [],
      markets: marketsWithOutcomes,
    }

    return NextResponse.json(transformedData)
  }
  catch (error) {
    console.error('Error in event API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
