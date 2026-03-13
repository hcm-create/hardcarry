import { NextRequest, NextResponse } from 'next/server'

interface ThumbnailSource { url: string; width?: number; height?: number }
interface VideoResult { title?: string; url?: string; thumbnail?: string | ThumbnailSource[] | ThumbnailSource; viewCount?: string; channel?: { title?: string } }
interface ExampleThumbnail { imageUrl: string; title: string; views: number; channel: string; videoUrl: string }

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SCRAPECREATORS_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'SCRAPECREATORS_API_KEY not configured' }, { status: 500 })

    const body = await request.json()
    const { query, top = 10, minViews = 100000 } = body
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 })

    const broadQuery = buildBroadSearchQuery(query)
    const encodedQuery = encodeURIComponent(broadQuery)
    const url = `https://api.scrapecreators.com/v1/youtube/search?query=${encodedQuery}&includeExtras=true&limit=50`
    console.log('Searching for:', broadQuery)

    const response = await fetch(url, { headers: { 'x-api-key': apiKey, 'Accept-Encoding': 'gzip, deflate' } })
    if (!response.ok) { const errorText = await response.text(); console.error('ScrapeCreators API error:', response.status, errorText); return NextResponse.json({ error: `API error: ${response.status}`, details: errorText }, { status: response.status }) }

    const data = await response.json()
    console.log('ScrapeCreators response keys:', Object.keys(data))
    
    let results: VideoResult[] = []
    if (data.results && Array.isArray(data.results)) results = data.results
    else if (data.data && Array.isArray(data.data)) results = data.data
    else if (data.videos && Array.isArray(data.videos)) results = data.videos
    else if (data.items && Array.isArray(data.items)) results = data.items
    else if (Array.isArray(data)) results = data
    
    console.log('Found results count:', results.length)
    if (results.length > 0) console.log('First result structure:', JSON.stringify(results[0], null, 2).slice(0, 500))
    if (!results.length) return NextResponse.json({ success: true, examples: [], message: 'No results found from API', debug: { responseKeys: Object.keys(data) } })

    const videosWithViews = results.map((video: any) => ({ ...video, _views: parseViewCount(video.viewCount || video.view_count || video.views || video.statistics?.viewCount), _thumbnail: video.thumbnail || video.thumbnails || video.thumb || video.image }))
    const sortedByViews = [...videosWithViews].sort((a, b) => b._views - a._views)
    const hasViewData = sortedByViews.some(v => v._views > 0)
    
    let filteredVideos: typeof sortedByViews
    if (hasViewData) {
      const veryPopular = sortedByViews.filter((video) => video._views >= 100000)
      if (veryPopular.length >= 3) { filteredVideos = veryPopular; console.log('Found', veryPopular.length, 'videos with 100K+ views') }
      else {
        const popular = sortedByViews.filter((video) => video._views >= 50000)
        if (popular.length >= 3) { filteredVideos = popular; console.log('Found', popular.length, 'videos with 50K+ views') }
        else {
          const somewhatPopular = sortedByViews.filter((video) => video._views >= 10000)
          if (somewhatPopular.length >= 3) { filteredVideos = somewhatPopular; console.log('Found', somewhatPopular.length, 'videos with 10K+ views') }
          else { filteredVideos = sortedByViews; console.log('Using all', sortedByViews.length, 'videos sorted by views') }
        }
      }
    } else { filteredVideos = sortedByViews; console.log('No view data available, using', sortedByViews.length, 'videos') }

    console.log('Top video views:', filteredVideos.slice(0, 5).map(v => v._views))
    const topVideos = filteredVideos.slice(0, top)

    const examples: ExampleThumbnail[] = await Promise.all(
      topVideos.map(async (video: any) => {
        const thumbnailUrl = getBestThumbnailUrl(video._thumbnail || video.thumbnail)
        console.log('Processing video:', video.title?.slice(0, 50), 'thumbnail:', thumbnailUrl?.slice(0, 100))
        let imageData: string | null = null
        if (thumbnailUrl) { try { imageData = await downloadThumbnailAsBase64(thumbnailUrl) } catch (err) { console.error('Failed to download thumbnail:', err) } }
        return { imageUrl: imageData || thumbnailUrl, title: video.title || video.name || 'Untitled', views: video._views || 0, channel: video.channel?.title || video.channel?.name || video.channelTitle || video.author || 'Unknown', videoUrl: video.url || video.link || video.videoUrl || '' }
      })
    )

    const validExamples = examples.filter((e) => e.imageUrl)
    console.log('Valid examples with images:', validExamples.length)

    return NextResponse.json({ success: true, examples: validExamples, totalFound: results.length, filteredCount: videosWithViews.length, debug: { topVideosCount: topVideos.length, validExamplesCount: validExamples.length } })
  } catch (error) { console.error('Search examples error:', error); return NextResponse.json({ error: 'Failed to search examples', details: String(error) }, { status: 500 }) }
}

function buildBroadSearchQuery(query: string): string {
  const stopWords = new Set(['my', 'i', 'me', 'we', 'our', 'the', 'a', 'an', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'about', 'against', 'new', 'first', 'last', 'video', 'vlog', 'watch', 'see', 'look', 'make', 'made', 'making'])
  const words = query.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word))
  const keyWords = words.slice(0, 4)
  const searchTerms = [...keyWords, 'popular'].join(' ')
  return searchTerms || query
}

function parseViewCount(viewCount: string | undefined): number {
  if (!viewCount) return 0
  const cleaned = viewCount.replace(/[^0-9.KMBkmb]/g, '')
  const match = cleaned.match(/^([\d.]+)([KMBkmb])?/)
  if (!match) return 0
  const num = parseFloat(match[1])
  const suffix = (match[2] || '').toUpperCase()
  switch (suffix) { case 'K': return Math.round(num * 1000); case 'M': return Math.round(num * 1000000); case 'B': return Math.round(num * 1000000000); default: return Math.round(num) }
}

function getBestThumbnailUrl(thumbnail: string | ThumbnailSource[] | ThumbnailSource | undefined): string {
  if (!thumbnail) return ''
  if (typeof thumbnail === 'string') return thumbnail
  if (Array.isArray(thumbnail)) { const best = thumbnail.reduce((prev, curr) => { const prevSize = (prev.width || 0) * (prev.height || 0); const currSize = (curr.width || 0) * (curr.height || 0); return currSize > prevSize ? curr : prev }, thumbnail[0]); return best?.url || '' }
  return thumbnail.url || ''
}

async function downloadThumbnailAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } })
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    return `data:${contentType};base64,${base64}`
  } catch { return null }
}
