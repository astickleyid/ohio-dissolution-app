import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(req: NextRequest) {
  try {
    // Get all submission IDs
    const ids: string[] = (await kv.get('submission_ids')) || [];
    
    console.log(`📊 Found ${ids.length} submission IDs`);
    
    // Fetch all submissions
    const submissions = await Promise.all(
      ids.map(async (id) => {
        const data = await kv.get(id);
        return data ? { id, ...data } : null;
      })
    );
    
    // Filter out null values and sort by date (newest first)
    const validSubmissions = submissions
      .filter((s) => s !== null)
      .sort((a: any, b: any) => {
        const dateA = new Date(a._submittedAt || 0).getTime();
        const dateB = new Date(b._submittedAt || 0).getTime();
        return dateB - dateA;
      });
    
    console.log(`✅ Returning ${validSubmissions.length} submissions`);
    
    return NextResponse.json({
      success: true,
      count: validSubmissions.length,
      submissions: validSubmissions,
    });
  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
