'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { createClient } from '@/lib/supabase/client'
import { StoryboardFrame as FrameType } from '@/types/database'
import { StoryboardFrame } from './storyboard-frame'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Image as ImageIcon, 
  Pencil, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Loader2,
  Save
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { v4 as uuidv4 } from 'uuid'

interface StoryboardCanvasProps {
  storyboardId: string
}

export function StoryboardCanvas({ storyboardId }: StoryboardCanvasProps) {
  const [frames, setFrames] = useState<FrameType[]>([])
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchFrames = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('storyboard_frames')
        .select('*')
        .eq('storyboard_id', storyboardId)
        .order('created_at')

      if (data) {
        setFrames(data)
      }
    } catch (error) {
      console.error('Error fetching frames:', error)
    } finally {
      setIsLoading(false)
    }
  }, [storyboardId, supabase])

  useEffect(() => {
    fetchFrames()
  }, [fetchFrames])

  const addFrame = async (type: 'image' | 'sketch' | 'text') => {
    const newFrame: Partial<FrameType> = {
      id: uuidv4(),
      storyboard_id: storyboardId,
      position_x: 100 + frames.length * 50,
      position_y: 100 + frames.length * 50,
      width: 300,
      height: 200,
      content_type: type,
      content_json: {},
      image_url: null,
    }

    setFrames((prev) => [...prev, newFrame as FrameType])
    setSelectedFrameId(newFrame.id!)

    try {
      await supabase.from('storyboard_frames').insert({
        id: newFrame.id,
        storyboard_id: storyboardId,
        position_x: newFrame.position_x,
        position_y: newFrame.position_y,
        width: newFrame.width,
        height: newFrame.height,
        content_type: type,
        content_json: {},
      })
    } catch (error) {
      console.error('Error creating frame:', error)
    }
  }

  const updateFrame = async (frameId: string, updates: Partial<FrameType>) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === frameId ? { ...f, ...updates } : f))
    )

    try {
      await supabase
        .from('storyboard_frames')
        .update(updates)
        .eq('id', frameId)
    } catch (error) {
      console.error('Error updating frame:', error)
    }
  }

  const deleteFrame = async (frameId: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== frameId))
    setSelectedFrameId(null)

    try {
      await supabase.from('storyboard_frames').delete().eq('id', frameId)
    } catch (error) {
      console.error('Error deleting frame:', error)
    }
  }

  const handleDragStart = (frameId: string, e: React.MouseEvent) => {
    e.preventDefault()
    const frame = frames.find((f) => f.id === frameId)
    if (!frame) return

    setIsDragging(true)
    setSelectedFrameId(frameId)
    setDragOffset({
      x: e.clientX / scale - frame.position_x,
      y: e.clientY / scale - frame.position_y,
    })
  }

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedFrameId) return

      const newX = e.clientX / scale - dragOffset.x
      const newY = e.clientY / scale - dragOffset.y

      setFrames((prev) =>
        prev.map((f) =>
          f.id === selectedFrameId
            ? { ...f, position_x: newX, position_y: newY }
            : f
        )
      )
    },
    [isDragging, selectedFrameId, scale, dragOffset]
  )

  const handleDragEnd = useCallback(async () => {
    if (!isDragging || !selectedFrameId) return

    setIsDragging(false)
    const frame = frames.find((f) => f.id === selectedFrameId)
    if (frame) {
      await updateFrame(selectedFrameId, {
        position_x: frame.position_x,
        position_y: frame.position_y,
      })
    }
  }, [isDragging, selectedFrameId, frames])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleDrag)
        window.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDrag, handleDragEnd])

  const handleCanvasClick = () => {
    setSelectedFrameId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="sm" />}>
            <Plus className="h-4 w-4 mr-2" />
            Add Frame
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addFrame('image')}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Image Frame
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFrame('sketch')}>
              <Pencil className="h-4 w-4 mr-2" />
              Sketch Frame
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFrame('text')}>
              <Type className="h-4 w-4 mr-2" />
              Text Frame
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={3}
        limitToBounds={false}
        onTransformed={(ref) => setScale(ref.state.scale)}
        panning={{ disabled: isDragging }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => zoomOut()}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => zoomIn()}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => resetTransform()}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
            >
              <div
                ref={canvasRef}
                className="relative"
                style={{
                  width: '4000px',
                  height: '3000px',
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                }}
                onClick={handleCanvasClick}
              >
                {frames.map((frame) => (
                  <StoryboardFrame
                    key={frame.id}
                    frame={frame}
                    isSelected={selectedFrameId === frame.id}
                    onSelect={() => setSelectedFrameId(frame.id)}
                    onUpdate={(updates) => updateFrame(frame.id, updates)}
                    onDelete={() => deleteFrame(frame.id)}
                    onDragStart={(e) => handleDragStart(frame.id, e)}
                    scale={scale}
                  />
                ))}

                {frames.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg mb-2">Empty Canvas</p>
                      <p className="text-sm">Click &quot;Add Frame&quot; to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
