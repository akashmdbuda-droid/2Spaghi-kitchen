import { useState, useEffect } from 'react'
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
  onPlaceTray: (position: number) => void
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
  const [draggingTray, setDraggingTray] = useState<Tray | null>(null)
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
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isTouchDragging, setIsTouchDragging] = useState(false)
  
  // Helper to calculate positions a tray would occupy
  const calculateTrayPositions = (startPosition: number, size: number): number[] => {
    if (size === 4) {
      return [startPosition, startPosition + 1, startPosition + 4, startPosition + 5]
    }
    return [startPosition]
  }

  // Update elapsed times every second
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, number> = {}
      trays.forEach(tray => {
        tray.pastas.forEach(pasta => {
          const elapsed = Math.floor((Date.now() - pasta.startTime) / 1000)
          times[pasta.id] = elapsed
        })
      })
      setElapsedTimes(times)
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
    return Math.max(0, pasta.cookingTime - elapsed)
  }

  const getProgress = (pasta: Pasta): number => {
    const elapsed = elapsedTimes[pasta.id] || 0
    return Math.min(100, (elapsed / pasta.cookingTime) * 100)
  }

  // Find all possible start positions for a 2x2 block that includes the given position
  const getPossibleStartPositions = (position: number): number[] => {
    // Grid layout:
    // Row 1: 0, 1, 2, 3
    // Row 2: 4, 5, 6, 7
    // 
    // A 2x2 block starting at X covers: X, X+1, X+4, X+5
    // Valid start positions: 0, 1, 2
    
    const col = position % 4
    const row = Math.floor(position / 4)
    const possibleStarts: number[] = []
    
    // Check which 2x2 blocks include this position
    // A block starting at startCol includes columns startCol and startCol+1
    for (let startCol = 0; startCol <= 2; startCol++) {
      // Check if this position's column is covered by a block starting at startCol
      if (col >= startCol && col <= startCol + 1) {
        // For bottom row positions, the block must start from top row
        if (row === 0 || row === 1) {
          possibleStarts.push(startCol)
        }
      }
    }
    
    return possibleStarts
  }

  const handlePositionClick = (position: number) => {
    const size = getTraySize(selectedTrayType)
    
    // Check if clicked position is occupied
    const existingTray = getTrayAtPosition(position)
    if (existingTray) {
      return // Don't place if clicked position is already occupied
    }
    
    if (size === 4) {
      // For extra large trays, find a valid 2x2 block that includes this position
      const possibleStarts = getPossibleStartPositions(position)
      
      // Try each possible start position and use the first valid one
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size)) {
          onPlaceTray(startPosition)
          return
        }
      }
      // No valid placement found
    } else {
      // For regular and large trays, use the clicked position directly
      if (canPlaceTray(position, size)) {
        onPlaceTray(position)
      }
    }
  }

  const getHoverPreview = (position: number): number[] | null => {
    if (hoveredPosition === null) return null
    const size = getTraySize(selectedTrayType)
    
    // Check if hovered position is already occupied
    const existingTray = getTrayAtPosition(position)
    if (existingTray) {
      return null
    }
    
    if (size === 4) {
      // For extra large trays, find a valid 2x2 block that includes this position
      const possibleStarts = getPossibleStartPositions(position)
      
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size)) {
          // Return the 2x2 block positions
          return [
            startPosition,           // top-left
            startPosition + 1,       // top-right
            startPosition + 4,       // bottom-left
            startPosition + 5        // bottom-right
          ]
        }
      }
      return null
    } else {
      // For regular and large trays, use the hovered position directly
      if (canPlaceTray(position, size)) {
        return [position]
      }
      return null
    }
  }

  const previewPositions = hoveredPosition !== null ? getHoverPreview(hoveredPosition) : null

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tray: Tray) => {
    setDraggingTray(tray)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tray.id)
  }

  const handleDragEnd = () => {
    setDraggingTray(null)
    setDropPreview(null)
    setSwapPreview(null)
  }

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, tray: Tray) => {
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggingTray(tray)
    setIsTouchDragging(false)
    e.stopPropagation() // Prevent triggering position click
  }

  const handleTouchMove = (e: React.TouchEvent, position: number) => {
    if (!draggingTray || !touchStartPos) return
    
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)
    
    // Start dragging after 10px movement
    if (deltaX > 10 || deltaY > 10) {
      if (!isTouchDragging) {
        setIsTouchDragging(true)
      }
      e.preventDefault() // Prevent scrolling
      
      // Simulate drag over behavior
      handleDragOverForTouch(position)
    }
  }

  const handleDragOverForTouch = (position: number) => {
    if (!draggingTray) return

    const size = getTraySize(draggingTray.type)
    
    // First, try normal placement
    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size, draggingTray.id)) {
          const newPreview = [
            startPosition,
            startPosition + 1,
            startPosition + 4,
            startPosition + 5
          ]
          if (!dropPreview || JSON.stringify(dropPreview) !== JSON.stringify(newPreview)) {
            setDropPreview(newPreview)
            setSwapPreview(null)
          }
          return
        }
      }
    } else {
      if (canPlaceTray(position, size, draggingTray.id)) {
        if (!dropPreview || dropPreview[0] !== position) {
          setDropPreview([position])
          setSwapPreview(null)
        }
        return
      }
    }

    // Normal placement not possible, try swap
    const swapOption = findSwapOption(draggingTray.id, position)
    
    if (swapOption && swapOption.displacedTrays.length > 0) {
      let dragToPositions: number[] = []
      if (size === 4) {
        const possibleStarts = getPossibleStartPositions(position)
        if (possibleStarts.length > 0) {
          const startPos = possibleStarts[0]
          dragToPositions = [startPos, startPos + 1, startPos + 4, startPos + 5]
        }
      } else {
        dragToPositions = [position]
      }

      const displacedTraysInfo = swapOption.displacedTrays.map(displaced => {
        const displacedTray = trays.find(t => t.id === displaced.trayId)
        if (!displacedTray) return null
        const displacedSize = getTraySize(displacedTray.type)
        return {
          trayId: displaced.trayId,
          currentPositions: displacedTray.positions,
          newPositions: calculateTrayPositions(displaced.newPosition, displacedSize)
        }
      }).filter((info): info is NonNullable<typeof info> => info !== null)

      if (displacedTraysInfo.length === swapOption.displacedTrays.length) {
        const newSwapPreview = {
          dragToPositions,
          displacedTraysInfo,
          swapOption
        }

        if (!swapPreview || JSON.stringify(swapPreview) !== JSON.stringify(newSwapPreview)) {
          setSwapPreview(newSwapPreview)
          setDropPreview(null)
        }
        return
      }
    }

    if (dropPreview) setDropPreview(null)
    if (swapPreview) setSwapPreview(null)
  }

  const handleTouchEnd = (_e: React.TouchEvent, position: number) => {
    if (!draggingTray || !isTouchDragging) {
      // If not dragging, treat as click
      setTouchStartPos(null)
      setDraggingTray(null)
      setIsTouchDragging(false)
      return
    }

    // Handle drop
    const size = getTraySize(draggingTray.type)
    
    // First, try normal placement
    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size, draggingTray.id)) {
          onMoveTray(draggingTray.id, startPosition)
          setDraggingTray(null)
          setDropPreview(null)
          setSwapPreview(null)
          setTouchStartPos(null)
          setIsTouchDragging(false)
          return
        }
      }
    } else {
      if (canPlaceTray(position, size, draggingTray.id)) {
        onMoveTray(draggingTray.id, position)
        setDraggingTray(null)
        setDropPreview(null)
        setSwapPreview(null)
        setTouchStartPos(null)
        setIsTouchDragging(false)
        return
      }
    }

    // Try swap if we have a swap preview active
    if (swapPreview && swapPreview.swapOption.displacedTrays.length > 0) {
      const dragToStart = swapPreview.dragToPositions[0]
      onSwapTrays(
        draggingTray.id,
        dragToStart,
        swapPreview.swapOption.displacedTrays
      )
    }

    setDraggingTray(null)
    setDropPreview(null)
    setSwapPreview(null)
    setTouchStartPos(null)
    setIsTouchDragging(false)
  }

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (!draggingTray) return

    const size = getTraySize(draggingTray.type)
    
    // First, try normal placement
    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size, draggingTray.id)) {
          const newPreview = [
            startPosition,
            startPosition + 1,
            startPosition + 4,
            startPosition + 5
          ]
          if (!dropPreview || JSON.stringify(dropPreview) !== JSON.stringify(newPreview)) {
            setDropPreview(newPreview)
            setSwapPreview(null)
          }
          return
        }
      }
    } else {
      if (canPlaceTray(position, size, draggingTray.id)) {
        if (!dropPreview || dropPreview[0] !== position) {
          setDropPreview([position])
          setSwapPreview(null)
        }
        return
      }
    }

    // Normal placement not possible, try swap
    const swapOption = findSwapOption(draggingTray.id, position)
    
    if (swapOption && swapOption.displacedTrays.length > 0) {
      // Calculate where the dragging tray will go
      let dragToPositions: number[] = []
      if (size === 4) {
        const possibleStarts = getPossibleStartPositions(position)
        if (possibleStarts.length > 0) {
          const startPos = possibleStarts[0]
          dragToPositions = [startPos, startPos + 1, startPos + 4, startPos + 5]
        }
      } else {
        dragToPositions = [position]
      }

      // Build info for all displaced trays
      const displacedTraysInfo = swapOption.displacedTrays.map(displaced => {
        const displacedTray = trays.find(t => t.id === displaced.trayId)
        if (!displacedTray) return null
        const displacedSize = getTraySize(displacedTray.type)
        return {
          trayId: displaced.trayId,
          currentPositions: displacedTray.positions,
          newPositions: calculateTrayPositions(displaced.newPosition, displacedSize)
        }
      }).filter((info): info is NonNullable<typeof info> => info !== null)

      if (displacedTraysInfo.length === swapOption.displacedTrays.length) {
        const newSwapPreview = {
          dragToPositions,
          displacedTraysInfo,
          swapOption
        }

        if (!swapPreview || JSON.stringify(swapPreview) !== JSON.stringify(newSwapPreview)) {
          setSwapPreview(newSwapPreview)
          setDropPreview(null)
        }
        return
      }
    }

    // No valid placement or swap
    if (dropPreview) setDropPreview(null)
    if (swapPreview) setSwapPreview(null)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault()
    if (!draggingTray) return

    const size = getTraySize(draggingTray.type)
    
    // First, try normal placement
    if (size === 4) {
      const possibleStarts = getPossibleStartPositions(position)
      for (const startPosition of possibleStarts) {
        if (canPlaceTray(startPosition, size, draggingTray.id)) {
          onMoveTray(draggingTray.id, startPosition)
          setDraggingTray(null)
          setDropPreview(null)
          setSwapPreview(null)
          return
        }
      }
    } else {
      if (canPlaceTray(position, size, draggingTray.id)) {
        onMoveTray(draggingTray.id, position)
        setDraggingTray(null)
        setDropPreview(null)
        setSwapPreview(null)
        return
      }
    }

    // Try swap if we have a swap preview active
    if (swapPreview && swapPreview.swapOption.displacedTrays.length > 0) {
      const dragToStart = swapPreview.dragToPositions[0]
      onSwapTrays(
        draggingTray.id,
        dragToStart,
        swapPreview.swapOption.displacedTrays
      )
    }

    setDraggingTray(null)
    setDropPreview(null)
    setSwapPreview(null)
  }

  return (
    <div className="sink-wrapper">
      <div className="sink-title">
        <h2>Boiling Water Sink</h2>
        <p>Tap empty positions to place trays • Drag or long-press trays to rearrange</p>
      </div>
      
      <div className={`sink ${draggingTray ? 'is-dragging-mode' : ''} ${isTouchDragging ? 'is-touch-dragging' : ''}`}>
        {Array.from({ length: 8 }, (_, index) => {
          const tray = getTrayAtPosition(index)
          const isPreview = previewPositions?.includes(index)
          const isStartOfTray = tray && tray.positions[0] === index
          const isPreviewStart = isPreview && previewPositions && previewPositions[0] === index
          
          // For extra large trays, identify if this position is part of the tray
          const isPartOfExtraLargeTray = tray && tray.type === 'extraLarge' && tray.positions.includes(index) && !isStartOfTray
          const isPartOfPreviewExtraLarge = isPreview && previewPositions && previewPositions.length === 4 && previewPositions.includes(index) && previewPositions[0] !== index
          const isExtraLargeStart = (tray?.type === 'extraLarge' && isStartOfTray) || (isPreviewStart && selectedTrayType === 'extraLarge')

          // Drop preview styling
          const isDropPreview = dropPreview?.includes(index)
          const isDropPreviewStart = dropPreview && dropPreview[0] === index
          const isDropPreviewPart = isDropPreview && !isDropPreviewStart
          const isDragging = draggingTray && tray && draggingTray.id === tray.id

          // Swap preview styling - now handles multiple displaced trays
          const isSwapDragTarget = swapPreview?.dragToPositions.includes(index)
          const isSwapDragTargetStart = swapPreview && swapPreview.dragToPositions[0] === index
          
          // Check if position is part of any displaced tray's current position
          const isSwapBlockingCurrent = swapPreview?.displacedTraysInfo.some(
            info => info.currentPositions.includes(index)
          )
          
          // Check if position is part of any displaced tray's new position
          const isSwapBlockingNew = swapPreview?.displacedTraysInfo.some(
            info => info.newPositions.includes(index)
          )
          
          // Check if position is the START of any displaced tray's new position
          const isSwapBlockingNewStart = swapPreview?.displacedTraysInfo.some(
            info => info.newPositions[0] === index
          )

          // Only disable pointer events if this position is part of an existing tray (not preview) and not in drag mode
          const shouldDisablePointer = isPartOfExtraLargeTray && !isPreview && !draggingTray
          
          return (
            <div
              key={index}
              className={`sink-position ${tray && !isDragging ? 'occupied' : ''} ${isPreviewStart ? 'preview' : ''} ${isPartOfPreviewExtraLarge ? 'preview-part' : ''} ${isExtraLargeStart && !isDragging ? 'extra-large-tray' : ''} ${isPartOfExtraLargeTray && !isDragging ? 'extra-large-part' : ''} ${isDropPreviewStart ? 'drop-preview' : ''} ${isDropPreviewPart ? 'drop-preview-part' : ''} ${isDragging ? 'dragging' : ''} ${isSwapDragTargetStart ? 'swap-drag-target' : ''} ${isSwapDragTarget && !isSwapDragTargetStart ? 'swap-drag-target-part' : ''} ${isSwapBlockingCurrent ? 'swap-blocking-current' : ''} ${isSwapBlockingNewStart ? 'swap-blocking-new' : ''} ${isSwapBlockingNew && !isSwapBlockingNewStart ? 'swap-blocking-new-part' : ''}`}
              onMouseEnter={() => !draggingTray && setHoveredPosition(index)}
              onMouseLeave={() => !draggingTray && setHoveredPosition(null)}
              onClick={() => !shouldDisablePointer && !draggingTray && handlePositionClick(index)}
              onDragEnter={handleDragEnter}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onTouchMove={(e) => draggingTray && handleTouchMove(e, index)}
              onTouchEnd={(e) => draggingTray && handleTouchEnd(e, index)}
            >
              {isStartOfTray && (
                <div 
                  className={`tray-container ${isDragging ? 'is-dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tray)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, tray)}
                  onTouchMove={(e) => handleTouchMove(e, index)}
                  onTouchEnd={(e) => handleTouchEnd(e, index)}
                >
                  <div className={`tray tray-${tray.type}`}>
                    <div className="tray-header">
                      <span className="drag-handle" title="Drag to move">⋮⋮</span>
                      <span className="tray-label">{getTrayLabel(tray)}</span>
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
                    </div>
                    <div className="pastas-list">
                      {tray.pastas.map((pasta) => {
                        const remaining = getRemainingTime(pasta)
                        const progress = getProgress(pasta)
                        const isDone = remaining === 0

                        return (
                          <div
                            key={pasta.id}
                            className={`pasta-item ${isDone ? 'done' : ''}`}
                          >
                            <div className="pasta-header">
                              <span className="pasta-name">{pasta.name}</span>
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
                            </div>
                            <div className="timer-display">
                              {isDone ? (
                                <span className="timer-done">DONE! 🎉</span>
                              ) : (
                                <span className="timer-countdown">
                                  {formatTime(remaining)}
                                </span>
                              )}
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="pasta-info">
                              {formatTime(pasta.cookingTime)} total
                            </div>
                          </div>
                        )
                      })}
                      {tray.pastas.length === 0 && (
                        <div className="empty-tray">Empty tray</div>
                      )}
                      {tray.type === 'large' && tray.pastas.length < 2 && (
                        <div className="tray-capacity">
                          Can hold {2 - tray.pastas.length} more pasta
                        </div>
                      )}
                      {tray.type === 'extraLarge' && tray.pastas.length < 6 && (
                        <div className="tray-capacity">
                          Can hold {6 - tray.pastas.length} more pasta{tray.pastas.length < 5 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!tray && !isPreview && !isDropPreview && (
                <div className="position-number">{index + 1}</div>
              )}
              {isPreviewStart && !tray && !draggingTray && (
                <div className="preview-indicator">
                  {selectedTrayType === 'regular' && 'Regular'}
                  {selectedTrayType === 'large' && 'Large (2x)'}
                  {selectedTrayType === 'extraLarge' && 'Extra Large (6x)'}
                </div>
              )}
              {isSwapDragTargetStart && !tray && (
                <div className="swap-indicator swap-drop-here">
                  ↓ Drop here
                </div>
              )}
              {isSwapBlockingNewStart && !isSwapBlockingCurrent && (
                <div className="swap-indicator swap-move-here">
                  ← Moves here
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Sink

