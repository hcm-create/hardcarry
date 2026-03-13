'use client'

import { useState, useRef, useEffect } from 'react'
import { StoryboardFrame as FrameType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  GripVertical, 
  Trash2, 
  Image as ImageIcon, 
  Pencil, 
  Type,
  X,
  Upload,
  Eraser,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryboardFrameProps {
  frame: FrameType
  isSelected: boolean
  onSelect: () => void
  onUpdate: (frame: Partial<FrameType>) => void
  onDelete: () => void
  onDragStart: (e: React.MouseEvent) => void
  scale: number
}

export function StoryboardFrame({
  frame,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  scale,
}: StoryboardFrameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState((frame.content_json as { text?: string })?.text || '')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [isErasing, setIsErasing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (frame.content_type === 'sketch' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        const contentJson = frame.content_json as { 
          paths?: { x: number; y: number; isEraser?: boolean }[][]
        }
        const paths = contentJson?.paths
        if (paths && paths.length > 0) {
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          paths.forEach((path) => {
            if (path.length > 0) {
              const isEraserPath = path[0]?.isEraser
              ctx.strokeStyle = isEraserPath ? '#1a1a1a' : '#ffffff'
              ctx.lineWidth = isEraserPath ? 20 : 2
              ctx.beginPath()
              ctx.moveTo(path[0].x, path[0].y)
              path.forEach((point) => {
                ctx.lineTo(point.x, point.y)
              })
              ctx.stroke()
            }
          })
        }
      }
    }
  }, [frame.content_type, frame.content_json])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (frame.content_type !== 'sketch') return
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    
    setIsDrawing(true)
    setLastPos({ x, y })
    setCurrentPath([{ x, y, isEraser: isErasing } as { x: number; y: number }])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || frame.content_type !== 'sketch') return
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    
    ctx.strokeStyle = isErasing ? '#1a1a1a' : '#ffffff'
    ctx.lineWidth = isErasing ? 20 : 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    
    setLastPos({ x, y })
    setCurrentPath(prev => [...prev, { x, y }])
  }

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 0) {
      setIsDrawing(false)
      const contentJson = frame.content_json as { paths?: { x: number; y: number; isEraser?: boolean }[][] }
      const existingPaths = contentJson?.paths || []
      const newPaths = [...existingPaths, currentPath]
      
      onUpdate({
        content_json: { 
          paths: newPaths
        }
      })
      setCurrentPath([])
    }
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    onUpdate({
      content_json: { paths: [] }
    })
  }

  const handleTextSave = () => {
    setIsEditing(false)
    onUpdate({
      content_json: { text }
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      onUpdate({
        image_url: event.target?.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className={cn(
        "absolute bg-card border-2 rounded-lg overflow-hidden shadow-lg transition-shadow",
        isSelected ? "border-primary shadow-xl" : "border-border"
      )}
      style={{
        left: frame.position_x,
        top: frame.position_y,
        width: frame.width,
        height: frame.height,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-8 bg-muted/80 flex items-center justify-between px-2 cursor-move z-10"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">
            {frame.content_type}
          </span>
        </div>
        {isSelected && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>

      <div className="pt-8 h-full">
        {frame.content_type === 'image' && (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            {frame.image_url ? (
              <img
                src={frame.image_url}
                alt="Frame"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            )}
          </div>
        )}

        {frame.content_type === 'sketch' && (
          <div className="relative w-full h-full">
            <canvas
              ref={canvasRef}
              width={frame.width}
              height={frame.height - 32}
              className={cn(
                "w-full h-full",
                isErasing ? "cursor-cell" : "cursor-crosshair"
              )}
              style={{ touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onPointerDown={(e) => {
                e.stopPropagation()
                ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
              }}
            />
            {isSelected && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 rounded-md p-1">
                <Button
                  variant={isErasing ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsErasing(!isErasing)
                  }}
                  title={isErasing ? "Switch to draw" : "Switch to eraser"}
                >
                  {isErasing ? <Pencil className="h-3.5 w-3.5" /> : <Eraser className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearCanvas()
                  }}
                  title="Clear canvas"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {frame.content_type === 'text' && (
          <div className="w-full h-full p-3">
            {isEditing ? (
              <div className="h-full flex flex-col gap-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 resize-none text-sm"
                  placeholder="Enter text..."
                  autoFocus
                />
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleTextSave}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="h-full cursor-text text-sm whitespace-pre-wrap"
                onClick={() => setIsEditing(true)}
              >
                {text || (
                  <span className="text-muted-foreground">Click to add text...</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
