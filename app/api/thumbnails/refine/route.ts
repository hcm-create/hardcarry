import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const body = await request.json()
    const { thumbnailId, originalImage, refinementPrompt, originalPrompt } = body
    if (!originalImage) return NextResponse.json({ error: 'Original image is required' }, { status: 400 })
    if (!refinementPrompt) return NextResponse.json({ error: 'Refinement instructions are required' }, { status: 400 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview', generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any })
    const prompt = buildRefinementPrompt(refinementPrompt, originalPrompt)
    const parts: any[] = [{ text: prompt }]
    
    if (originalImage.startsWith('data:')) {
      const base64Data = originalImage.replace(/^data:image\/\w+;base64,/, '')
      const mimeMatch = originalImage.match(/^data:(image\/\w+);base64,/)
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
      parts.push({ inlineData: { mimeType, data: base64Data } })
    }

    const result = await model.generateContent(parts)
    const response = result.response
    let imageData: string | null = null
    let textResponse: string | null = null

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if ((part as any).inlineData) { const inlineData = (part as any).inlineData; imageData = `data:${inlineData.mimeType};base64,${inlineData.data}` }
        else if (part.text) { textResponse = part.text }
      }
    }

    if (!imageData) return NextResponse.json({ error: 'No image generated', details: textResponse }, { status: 500 })

    const teamId = TEST_TEAM_ID
    const supabase = await createClient()
    const { data: thumbnail, error: dbError } = await supabase.from('thumbnails').insert({ team_id: teamId, title: 'Refined Thumbnail', video_topic: null, prompt: `${originalPrompt || ''}\n\nREFINEMENT: ${refinementPrompt}`, image_url: imageData, status: 'completed' }).select().single()
    if (dbError) console.error('Database error:', dbError)

    return NextResponse.json({ success: true, thumbnail, imageData, refinementApplied: refinementPrompt })
  } catch (error) { console.error('Thumbnail refinement error:', error); return NextResponse.json({ error: 'Failed to refine thumbnail', details: String(error) }, { status: 500 }) }
}

function buildRefinementPrompt(refinementInstructions: string, originalPrompt?: string): string {
  return `You are refining an existing YouTube thumbnail. I've attached the original thumbnail image.\n\nORIGINAL CONTEXT:\n${originalPrompt || 'A YouTube video thumbnail'}\n\nREFINEMENT INSTRUCTIONS:\n${refinementInstructions}\n\nIMPORTANT GUIDELINES:\n- Keep the overall composition and concept similar to the original\n- Apply the specific changes requested above\n- Maintain the 16:9 aspect ratio (1280x720 pixels)\n- Keep the same general style and mood unless asked to change it\n- Preserve any text that was in the original unless asked to modify it\n- Keep the bottom-right corner clear for YouTube timestamp\n\nGenerate the refined thumbnail image directly.`
}
