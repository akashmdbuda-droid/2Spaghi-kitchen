import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core'
import { Tray, Pasta } from '../App'
import './Sink.css'

interface DisplacedTray {
  trayId: string
  newPosition: number
}

interface SwapOption {
  displacedTrays: DisplacedTray[]
}

interface SinkProps {
  trays: Tray[]
  onPlaceTray: (position: number, trayType?: 'regular' | 'large' | 'extraLarge') => void
  onMobilePositionTap?: (position: number) => void
  onRemoveTray: (trayId: string) => void
  onRemovePasta: (trayId: string, pastaId: string) => void
  onMoveTray: (trayId: string, newPosition: number) => void
  onSwapTrays: (draggingTrayId: string, newDraggingPosition: number, displacedTrays: DisplacedTray[]) => void
  selectedTrayType: 'regular' | 'large' | 'extraLarge'
  getTraySize: (type: 'regular' | 'large' | 'extraLarge') => number
  canPlaceTray: (position: number, size: number, excludeTrayId?: string) => boolean
  findSwapOption: (draggingTrayId: string, targetPosition: number) => SwapOption | null
}

const Sink = ({
  trays,
  onPlaceTray,
  onMobilePositionTap,
  onRemoveTray,
  onRemovePasta,
  onMoveTray,
  onSwapTrays,
  selectedTrayType,
  getTraySize,
  canPlaceTray,
  findSwapOption
}: SinkProps) => {
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null)
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({})
  const [activeTray, setActiveTray] = useState<Tray | null>(null)
  const [dropPreview, setDropPreview] = useState<number[] | null>(null)
  const [swapPreview, setSwapPreview] = useState<{
    dragToPositions: number[]
    displacedTraysInfo: Array<{
      trayId: string
      currentPositions: number[]
      newPositions: number[]
    }>
    swapOption: SwapOption
  } | null>(null)

  // Track announced pastas to prevent repeated speech
  const [announcedPastaIds, setAnnouncedPastaIds] = useState<Set<string>>(new Set())

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms hold before drag starts
        tolerance: 8,
      },
    })
  )

  // Helper to calculate positions a tray would occupy
  const calculateTrayPositions = (startPosition: number, size: number): number[] => {
    if (size === 4) {
      const isMobilePortrait = window.innerWidth <= 768
      if (isMobilePortrait) {
        // Mobile portrait: 2 columns, 4 rows
        // 2x2 block covers 2 columns × 2 rows = 4 consecutive positions
        return [startPosition, startPosition + 1, startPosition + 2, startPosition + 3]
      }
      // Desktop: 4 columns, 2 rows - 2x2 block spans columns and rows
      return [startPosition, startPosition + 1, startPosition + 4, startPosition + 5]
    }
    return [startPosition]
  }

  // Get valid start positions for extra large trays
  const getValidExtraLargeStartPositions = (): number[] => {
    const isMobilePortrait = window.innerWidth <= 768
    // Mobile portrait (2 cols): positions 0, 2, 4 (any row that has room below)
    // Desktop (4 cols): positions 0, 1, 2 (top row with room to the right)
    return isMobilePortrait ? [0, 2, 4] : [0, 1, 2]
  }

  // Find possible start positions for a 2x2 block that includes the given position
  const getPossibleStartPositions = (position: number): number[] => {
    const possibleStarts: number[] = []
    const validStarts = getValidExtraLargeStartPositions()

    for (const startPos of validStarts) {
      const blockPositions = calculateTrayPositions(startPos, 4)
      if (blockPositions.includes(position)) {
        possibleStarts.push(startPos)
      }
    }

    return possibleStarts
  }

  // Update elapsed times every second
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, number> = {}
      const newAnnounced = new Set(announcedPastaIds)
      let hasNewAnnouncement = false

      trays.forEach(tray => {
        tray.pastas.forEach(pasta => {
          const elapsed = Math.floor((Date.now() - pasta.startTime) / 1000)
          times[pasta.id] = elapsed

          // Check for completion and announce
          const remaining = pasta.cookingTime - elapsed // Can be negative now

          if (remaining <= 0 && !newAnnounced.has(pasta.id)) {
            // Cancel any pending speech to ensure this one plays
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(`${pasta.name} is ready`)
            window.speechSynthesis.speak(utterance)
            newAnnounced.add(pasta.id)
            hasNewAnnouncement = true
          }
        })
      })

      setElapsedTimes(times)
      if (hasNewAnnouncement) {
        setAnnouncedPastaIds(newAnnounced)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [trays])

  const getTrayAtPosition = (position: number): Tray | undefined => {
    return trays.find(tray => tray.positions.includes(position))
  }

  const getTrayLabel = (tray: Tray): string => {
    switch (tray.type) {
      case 'regular': return 'Regular'
      case 'large': return 'Large (2x)'
      case 'extraLarge': return 'Extra Large (6x)'
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRemainingTime = (pasta: Pasta): number => {
    const elapsed = elapsedTimes[pasta.id] || 0
    return pasta.cookingTime - elapsed
  }

  const getProgress = (pasta: Pasta): number => {
    const elapsed = elapsedTimes[pasta.id] || 0
    return Math.min(100, (elapsed / pasta.cookingTime) * 100)
  }

  const handlePositionClick = (position: number) => {
    const existingTray = getTrayAtPosition(position)
    if (existingTray) return

    const isMobile = window.innerWidth <= 768
    if (isMobile && onMobilePositionTap) {
      onMobilePositionTap(position)
      return
    }

    const size = getTraySize(selectedTrayType)

    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size)) {
          onPlaceTray(startPosition)
          return
        }
      }

      const allStartPositions = getValidExtraLargeStartPositions()
      for (const startPosition of allStartPositions) {
        if (canPlaceTray(startPosition, size)) {
          onPlaceTray(startPosition)
          return
        }
      }
    } else {
      if (canPlaceTray(position, size)) {
        onPlaceTray(position)
      }
    }
  }

  const getHoverPreview = (position: number): number[] | null => {
    if (hoveredPosition === null) return null
    const size = getTraySize(selectedTrayType)

    const existingTray = getTrayAtPosition(position)
    if (existingTray) return null

    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size)) {
          return calculateTrayPositions(startPosition, size)
        }
      }

      const allStartPositions = getValidExtraLargeStartPositions()
      for (const startPosition of allStartPositions) {
        if (canPlaceTray(startPosition, size)) {
          return calculateTrayPositions(startPosition, size)
        }
      }
      return null
    } else {
      if (canPlaceTray(position, size)) {
        return [position]
      }
      return null
    }
  }

  // @dnd-kit handlers
  const handleDragStart = (event: DragStartEvent) => {
    const trayId = event.active.id as string
    const tray = trays.find(t => t.id === trayId)
    if (tray) {
      setActiveTray(tray)
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over || !activeTray) {
      setDropPreview(null)
      setSwapPreview(null)
      return
    }

    const position = parseInt(over.id as string, 10)

    const size = getTraySize(activeTray.type)

    // Try normal placement
    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size, activeTray.id)) {
          setDropPreview(calculateTrayPositions(startPosition, size))
          setSwapPreview(null)
          return
        }
      }
    } else {
      if (canPlaceTray(position, size, activeTray.id)) {
        setDropPreview([position])
        setSwapPreview(null)
        return
      }
    }

    // Try swap
    const swapOption = findSwapOption(activeTray.id, position)
    if (swapOption && swapOption.displacedTrays.length > 0) {
      let dragToPositions: number[] = []
      if (size === 4) {
        const possibleStarts = getPossibleStartPositions(position)
        if (possibleStarts.length > 0) {
          dragToPositions = calculateTrayPositions(possibleStarts[0], size)
        }
      } else {
        dragToPositions = [position]
      }

      const displacedTraysInfo = swapOption.displacedTrays.map(displaced => {
        const displacedTray = trays.find(t => t.id === displaced.trayId)
        if (!displacedTray) return null
        return {
          trayId: displaced.trayId,
          currentPositions: displacedTray.positions,
          newPositions: calculateTrayPositions(displaced.newPosition, getTraySize(displacedTray.type))
        }
      }).filter((info): info is NonNullable<typeof info> => info !== null)

      if (displacedTraysInfo.length === swapOption.displacedTrays.length) {
        setSwapPreview({ dragToPositions, displacedTraysInfo, swapOption })
        setDropPreview(null)
        return
      }
    }

    setDropPreview(null)
    setSwapPreview(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event

    if (over && activeTray) {
      const position = parseInt(over.id as string, 10)
      const size = getTraySize(activeTray.type)

      let moved = false

      // Try normal placement first (only if dropPreview is active)
      if (dropPreview && dropPreview.length > 0) {
        const startPosition = dropPreview[0]
        if (canPlaceTray(startPosition, size, activeTray.id)) {
          onMoveTray(activeTray.id, startPosition)
          moved = true
        }
      }

      // If normal placement didn't work, try based on position
      if (!moved && !swapPreview) {
        if (size === 4) {
          const possibleStarts = getPossibleStartPositions(position)
          for (const startPosition of possibleStarts) {
            if (canPlaceTray(startPosition, size, activeTray.id)) {
              onMoveTray(activeTray.id, startPosition)
              moved = true
              break
            }
          }
        } else {
          if (canPlaceTray(position, size, activeTray.id)) {
            onMoveTray(activeTray.id, position)
            moved = true
          }
        }
      }

      // Try swap ONLY if normal placement didn't happen and swap preview is active
      if (!moved && swapPreview && swapPreview.swapOption.displacedTrays.length > 0) {
        const dragToStart = swapPreview.dragToPositions[0]
        onSwapTrays(activeTray.id, dragToStart, swapPreview.swapOption.displacedTrays)
      }
    }

    // Reset state
    setActiveTray(null)
    setDropPreview(null)
    setSwapPreview(null)
  }

  const previewPositions = hoveredPosition !== null && !activeTray ? getHoverPreview(hoveredPosition) : null

  // Render a tray card (used for both regular rendering and drag overlay)
  const renderTrayCard = (tray: Tray, isOverlay = false) => (
    <div className={`tray tray-${tray.type} ${isOverlay ? 'tray-overlay' : ''}`}>
      <div className="tray-header">
        {/* Drag handle removed visually, but entire card is draggable due to draggable listeners on container */}
        <span className="tray-label">{getTrayLabel(tray)}</span>
        {!isOverlay && (
          <button
            className="remove-tray-btn"
            onClick={(e) => {
              e.stopPropagation()
              onRemoveTray(tray.id)
            }}
            title="Remove tray"
          >
            ×
          </button>
        )}
      </div>
      <div className="pastas-list">
        {tray.pastas.map((pasta) => {
          const remaining = getRemainingTime(pasta) // can be negative
          const progress = getProgress(pasta)
          const isDone = remaining <= 0

          return (
            <div key={pasta.id} className={`pasta-item ${isDone ? 'done' : ''}`}>
              <div className="pasta-header">
                <span className="pasta-name">{pasta.name}</span>
                {!isOverlay && (
                  <button
                    className="remove-pasta-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemovePasta(tray.id, pasta.id)
                    }}
                    title="Remove pasta"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="timer-display">
                {isDone ? (
                  <div className="timer-status">
                    <span className="timer-done">DONE!</span>
                    <span className="timer-overcooked">
                      +{formatTime(Math.abs(remaining))}
                    </span>
                  </div>
                ) : (
                  <span className="timer-countdown">{formatTime(remaining)}</span>
                )}
              </div>
              {!isOverlay && (
                <>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="pasta-info">{formatTime(pasta.cookingTime)} total</div>
                </>
              )}
            </div>
          )
        })}
        {tray.pastas.length === 0 && <div className="empty-tray">Empty tray</div>}
        {!isOverlay && tray.type === 'large' && tray.pastas.length < 2 && (
          <div className="tray-capacity">Can hold {2 - tray.pastas.length} more pasta</div>
        )}
        {!isOverlay && tray.type === 'extraLarge' && tray.pastas.length < 6 && (
          <div className="tray-capacity">
            Can hold {6 - tray.pastas.length} more pasta{tray.pastas.length < 5 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="sink-wrapper">
        <div className={`sink ${activeTray ? 'is-dragging-mode' : ''}`}>
          {Array.from({ length: 8 }, (_, index) => {
            const tray = getTrayAtPosition(index)
            const isPreview = previewPositions?.includes(index)
            const isStartOfTray = tray && tray.positions[0] === index
            const isPreviewStart = isPreview && previewPositions && previewPositions[0] === index

            const isPartOfExtraLargeTray = tray && tray.type === 'extraLarge' && tray.positions.includes(index) && !isStartOfTray
            const isPartOfPreviewExtraLarge = isPreview && previewPositions && previewPositions.length === 4 && previewPositions.includes(index) && previewPositions[0] !== index
            const isExtraLargeStart = (tray?.type === 'extraLarge' && isStartOfTray) || (isPreviewStart && selectedTrayType === 'extraLarge')

            const isDropPreview = dropPreview?.includes(index)
            const isDropPreviewStart = dropPreview && dropPreview[0] === index
            const isDropPreviewPart = isDropPreview && !isDropPreviewStart
            const isDragging = activeTray && tray && activeTray.id === tray.id

            const isSwapDragTarget = swapPreview?.dragToPositions.includes(index)
            const isSwapDragTargetStart = swapPreview && swapPreview.dragToPositions[0] === index
            const isSwapBlockingCurrent = swapPreview?.displacedTraysInfo.some(info => info.currentPositions.includes(index))
            const isSwapBlockingNew = swapPreview?.displacedTraysInfo.some(info => info.newPositions.includes(index))
            const isSwapBlockingNewStart = swapPreview?.displacedTraysInfo.some(info => info.newPositions[0] === index)

            const shouldDisablePointer = isPartOfExtraLargeTray && !isPreview && !activeTray

            // Disable droppable for positions that are part of extra-large tray but not the start
            // EXCEPT when dragging that same tray (we need to detect those positions for preview)
            const isPartOfDraggingTray = activeTray && tray && activeTray.id === tray.id
            const isDisabledDroppable = isPartOfExtraLargeTray && !isStartOfTray && !isPartOfDraggingTray

            return (
              <DroppablePosition
                key={index}
                id={index.toString()}
                dataPosition={index}
                disabled={isDisabledDroppable}
                className={`sink-position 
                  ${tray && !isDragging ? 'occupied' : ''} 
                  ${isPreviewStart ? 'preview' : ''} 
                  ${isPartOfPreviewExtraLarge ? 'preview-part' : ''} 
                  ${isExtraLargeStart && !isDragging ? 'extra-large-tray' : ''} 
                  ${isPartOfExtraLargeTray && !isDragging ? 'extra-large-part' : ''} 
                  ${isDropPreviewStart ? 'drop-preview' : ''} 
                  ${isDropPreviewPart ? 'drop-preview-part' : ''} 
                  ${isDragging ? 'dragging' : ''} 
                  ${isSwapDragTargetStart ? 'swap-drag-target' : ''} 
                  ${isSwapDragTarget && !isSwapDragTargetStart ? 'swap-drag-target-part' : ''} 
                  ${isSwapBlockingCurrent ? 'swap-blocking-current' : ''} 
                  ${isSwapBlockingNewStart ? 'swap-blocking-new' : ''} 
                  ${isSwapBlockingNew && !isSwapBlockingNewStart ? 'swap-blocking-new-part' : ''}
                `}
                onMouseEnter={() => !activeTray && setHoveredPosition(index)}
                onMouseLeave={() => !activeTray && setHoveredPosition(null)}
                onClick={() => !shouldDisablePointer && !activeTray ? handlePositionClick(index) : undefined}
              >
                {isStartOfTray && (
                  <DraggableTray tray={tray} isDragging={!!isDragging}>
                    {renderTrayCard(tray)}
                  </DraggableTray>
                )}
                {!tray && !isPreview && !isDropPreview && (
                  <div className="position-number">{index + 1}</div>
                )}
                {isPreviewStart && !tray && !activeTray && (
                  <div className="preview-indicator">
                    {selectedTrayType === 'regular' && 'Regular'}
                    {selectedTrayType === 'large' && 'Large (2x)'}
                    {selectedTrayType === 'extraLarge' && 'Extra Large (6x)'}
                  </div>
                )}
                {isSwapDragTargetStart && !tray && (
                  <div className="swap-indicator swap-drop-here">↓ Drop here</div>
                )}
                {isSwapBlockingNewStart && !isSwapBlockingCurrent && (
                  <div className="swap-indicator swap-move-here">← Moves here</div>
                )}
              </DroppablePosition>
            )
          })}
        </div>
      </div>

      {/* Drag overlay - follows cursor/finger smoothly */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'ease-out',
      }}>
        {activeTray && (
          <div className="drag-overlay-tray">
            {renderTrayCard(activeTray, true)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Droppable position component - renders a full-size droppable cell
import { useDroppable } from '@dnd-kit/core'

function DroppablePosition({
  id,
  children,
  disabled,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  dataPosition
}: {
  id: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  dataPosition?: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: disabled
  })

  return (
    <div
      ref={setNodeRef}
      id={id}
      data-position={dataPosition}
      className={`${className} ${isOver && !disabled ? 'drag-over' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  )
}

// Draggable tray component
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function DraggableTray({ tray, isDragging, children }: { tray: Tray; isDragging: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tray.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? 'opacity 0.2s ease' : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tray-container ${isDragging ? 'is-dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}

export default Sink
