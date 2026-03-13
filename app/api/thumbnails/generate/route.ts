import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const body = await request.json()
    const { prompt, headshots, title, videoTopic, examples } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const baseParts: any[] = []
    
    if (headshots && headshots.length > 0) {
      for (const headshot of headshots) {
        if (headshot.startsWith('data:')) {
          const base64Data = headshot.replace(/^data:image\/\w+;base64,/, '')
          const mimeMatch = headshot.match(/^data:(image\/\w+);base64,/)
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
          baseParts.push({ inlineData: { mimeType, data: base64Data } })
        }
      }
    }

    if (examples && examples.length > 0) {
      for (const exampleUrl of examples) {
        if (exampleUrl.startsWith('data:')) {
          const base64Data = exampleUrl.replace(/^data:image\/\w+;base64,/, '')
          const mimeMatch = exampleUrl.match(/^data:(image\/\w+);base64,/)
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
          baseParts.push({ inlineData: { mimeType, data: base64Data } })
        }
      }
    }

    const headshotCount = headshots?.length || 0
    const hasExamples = examples?.length > 0
    const variationStyles = ['bold and dramatic with high contrast colors', 'clean and minimal with subtle elegance', 'energetic and dynamic with action-oriented composition', 'professional and polished with premium feel']

    const generationPromises = variationStyles.map(async (style, index) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview', generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any })
      const variationPrompt = buildThumbnailPrompt(prompt, hasExamples, headshotCount, style, index + 1)
      const parts = [{ text: variationPrompt }, ...baseParts]
      try {
        const result = await model.generateContent(parts)
        const response = result.response
        for (const candidate of response.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if ((part as any).inlineData) {
              const inlineData = (part as any).inlineData
              return { index, imageData: `data:${inlineData.mimeType};base64,${inlineData.data}`, style }
            }
          }
        }
        return { index, imageData: null, style, error: 'No image in response' }
      } catch (err) { console.error(`Variation ${index + 1} failed:`, err); return { index, imageData: null, style, error: String(err) } }
    })

    const results = await Promise.all(generationPromises)
    const successfulVariations = results.filter(r => r.imageData)
    if (successfulVariations.length === 0) return NextResponse.json({ error: 'Failed to generate any thumbnail variations' }, { status: 500 })

    const teamId = TEST_TEAM_ID
    const supabase = await createClient()
    const thumbnailInserts = successfulVariations.map((v) => ({ team_id: teamId, title: `${title || 'Untitled'} - Variation ${v.index + 1}`, video_topic: videoTopic, prompt: prompt, image_url: v.imageData, status: 'completed' }))
    const { data: thumbnails, error: dbError } = await supabase.from('thumbnails').insert(thumbnailInserts).select()
    if (dbError) console.error('Database error:', dbError)

    return NextResponse.json({ success: true, thumbnails: thumbnails || [], variations: successfulVariations.map(v => ({ index: v.index, imageData: v.imageData, style: v.style, thumbnailId: thumbnails?.find((t, i) => i === successfulVariations.indexOf(v))?.id })), totalGenerated: successfulVariations.length, warning: dbError ? 'Some thumbnails failed to save to database' : undefined })
  } catch (error) { console.error('Thumbnail generation error:', error); return NextResponse.json({ error: 'Failed to generate thumbnail', details: String(error) }, { status: 500 }) }
}

function buildThumbnailPrompt(userPrompt: string, hasExamples: boolean = false, headshotCount: number = 0, variationStyle: string = '', variationNumber: number = 1): string {
  let prompt = `Generate a professional YouTube video thumbnail in 16:9 aspect ratio (1280x720 pixels).\n\nThis is VARIATION ${variationNumber} - make it ${variationStyle}.\n\n${userPrompt}\n\nSTYLE REQUIREMENTS:\n- Professional, high-contrast, clean design\n- Dark, moody background (NOT solid black - use a darkened real-world scene)\n- High contrast between foreground elements and background\n- Text must be large, bold, and readable at small sizes\n- Maximum 3-5 words of text\n- Keep bottom-right corner clear (YouTube timestamp overlay area)\n- Dramatic lighting on any people\n- Similar to top YouTube tech/business channel thumbnails\n\nVARIATION STYLE: ${variationStyle}\nMake this variation distinctly different from others while maintaining the core message.`
  if (headshotCount > 0) prompt += `\n\nHEADSHOT IMAGES:\nI've attached ${headshotCount} headshot photo${headshotCount > 1 ? 's' : ''} of the person${headshotCount > 1 ? 's' : ''} to include in the thumbnail.\nUse the exact likeness from ${headshotCount > 1 ? 'each' : 'the'} reference photo.\n${headshotCount === 1 ? 'Position the person prominently in the composition.' : `Arrange all ${headshotCount} people in an engaging group composition.`}`
  if (hasExamples) prompt += `\n\nSTYLE EXAMPLES:\nI've attached example thumbnails from high-performing videos. Study these for inspiration:\n- Analyze their color palettes and contrast levels\n- Note the text placement, size, and styling\n- Observe the composition and visual hierarchy\n- Understand what makes them attention-grabbing\n\nCreate something ORIGINAL that captures what makes these examples effective.\nDo NOT copy them directly - use them as inspiration for style and composition.`
  prompt += `\n\nOUTPUT: Generate the thumbnail image directly.`
  return prompt
}
