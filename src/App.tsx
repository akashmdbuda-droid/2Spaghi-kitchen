import { useState } from 'react'
import Sink from './components/Sink'
import TrayDropdown from './components/TrayDropdown'
import PastaForm from './components/PastaForm'
import MobileTrayModal from './components/MobileTrayModal'
import MobilePastaModal from './components/MobilePastaModal'
import './App.css'

export interface Pasta {
  id: string
  name: string
  cookingTime: number // in seconds
  startTime: number // timestamp
  trayType: 'regular' | 'large' | 'extraLarge'
}

export interface Tray {
  id: string
  type: 'regular' | 'large' | 'extraLarge'
  positions: number[] // which positions in sink (0-7)
  pastas: Pasta[]
}

function App() {
  const [trays, setTrays] = useState<Tray[]>([])
  const [selectedTrayType, setSelectedTrayType] = useState<'regular' | 'large' | 'extraLarge'>('regular')
  const [newlyAddedTrayId, setNewlyAddedTrayId] = useState<string | null>(null)
  
  // Mobile modals
  const [showTrayModal, setShowTrayModal] = useState(false)
  const [showPastaModal, setShowPastaModal] = useState(false)
  const [pendingTrayPosition, setPendingTrayPosition] = useState<number | null>(null)
  const [pendingTrayType, setPendingTrayType] = useState<'regular' | 'large' | 'extraLarge' | null>(null)

  const getTraySize = (type: 'regular' | 'large' | 'extraLarge'): number => {
    switch (type) {
      case 'regular': return 1
      case 'large': return 1
      case 'extraLarge': return 4
      default: return 1
    }
  }

  // Calculate positions for a 2x2 block based on layout
  const calculate2x2BlockPositions = (startPosition: number): number[] => {
    const isMobilePortrait = typeof window !== 'undefined' && window.innerWidth <= 768
    
    if (isMobilePortrait) {
      // Portrait: 2 columns, 4 rows
      // 2x2 block MUST start from column 0 (even positions: 0, 2, 4)
      // Block covers: startPosition, startPosition+1, startPosition+2, startPosition+3
      return [
        startPosition,           // top-left
        startPosition + 1,       // top-right
        startPosition + 2,       // bottom-left
        startPosition + 3        // bottom-right
      ]
    } else {
      // Desktop: 4 columns, 2 rows
      // 2x2 block: covers 2 columns x 2 rows
      return [
        startPosition,           // top-left
        startPosition + 1,       // top-right
        startPosition + 4,       // bottom-left
        startPosition + 5        // bottom-right
      ]
    }
  }

  // Get valid start positions for extra large trays based on layout
  const getValidExtraLargeStartPositions = (): number[] => {
    const isMobilePortrait = typeof window !== 'undefined' && window.innerWidth <= 768
    // Mobile portrait (2 cols): only column 0 positions that have room below: 0, 2, 4
    // Desktop (4 cols): positions 0, 1, 2 (top row, with room to the right)
    return isMobilePortrait ? [0, 2, 4] : [0, 1, 2]
  }

  const canPlaceTray = (startPosition: number, size: number, excludeTrayId?: string): boolean => {
    // For extra large trays (size 4), they occupy a 2x2 block
    if (size === 4) {
      const validStarts = getValidExtraLargeStartPositions()
      
      // Start position must be a valid 2x2 block start
      if (!validStarts.includes(startPosition)) {
        return false
      }
      
      // Calculate 2x2 block positions based on layout
      const blockPositions = calculate2x2BlockPositions(startPosition)
      
      // Check if all positions are within bounds (0-7)
      if (blockPositions.some(pos => pos < 0 || pos > 7)) {
        return false
      }
      
      // Check if any position is already occupied (excluding the tray being moved)
      const occupiedPositions = new Set<number>()
      trays.forEach(tray => {
        if (tray.id !== excludeTrayId) {
          tray.positions.forEach(pos => occupiedPositions.add(pos))
        }
      })
      
      for (const pos of blockPositions) {
        if (occupiedPositions.has(pos)) {
          return false
        }
      }
      
      return true
    }

    // For regular and large trays (size 1), check single position
    if (startPosition < 0 || startPosition > 7) return false

    // Check if position is already occupied (excluding the tray being moved)
    const occupiedPositions = new Set<number>()
    trays.forEach(tray => {
      if (tray.id !== excludeTrayId) {
        tray.positions.forEach(pos => occupiedPositions.add(pos))
      }
    })

    if (occupiedPositions.has(startPosition)) {
      return false
    }

    return true
  }

  const handlePlaceTray = (position: number, trayType?: 'regular' | 'large' | 'extraLarge') => {
    const typeToUse = trayType || selectedTrayType
    const size = getTraySize(typeToUse)
    
    let startPosition = position
    
    if (!canPlaceTray(position, size)) {
      // For extra large trays, auto-find any empty 2x2 space
      if (size === 4) {
        const validStartPositions = getValidExtraLargeStartPositions()
        
        let foundPosition = false
        for (const tryPos of validStartPositions) {
          if (canPlaceTray(tryPos, size)) {
            startPosition = tryPos
            foundPosition = true
            break
          }
        }
        
        if (!foundPosition) {
          return // No space available anywhere
        }
      } else {
        return // For regular/large trays, don't auto-relocate
      }
    }

    const positions: number[] = []
    if (size === 4) {
      // Extra large tray: 2x2 block
      positions.push(...calculate2x2BlockPositions(startPosition))
    } else {
      // Regular and large trays: single position
      positions.push(startPosition)
    }

    const newTray: Tray = {
      id: `tray-${Date.now()}`,
      type: typeToUse,
      positions,
      pastas: []
    }

    setTrays([...trays, newTray])
    
    // On mobile, show pasta modal after placing tray
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    if (isMobile) {
      setPendingTrayType(typeToUse)
      setShowPastaModal(true)
      setNewlyAddedTrayId(newTray.id)
    } else {
      // Desktop: auto-select for pasta form
      setNewlyAddedTrayId(newTray.id)
      setTimeout(() => setNewlyAddedTrayId(null), 100)
    }
  }

  // Mobile: Handle empty position tap
  const handleMobilePositionTap = (position: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    if (isMobile) {
      setPendingTrayPosition(position)
      setShowTrayModal(true)
    } else {
      // Desktop: use normal flow
      handlePlaceTray(position)
    }
  }

  // Mobile: Handle tray type selection from modal
  const handleMobileTraySelect = (type: 'regular' | 'large' | 'extraLarge') => {
    if (pendingTrayPosition !== null) {
      handlePlaceTray(pendingTrayPosition, type)
      setPendingTrayPosition(null)
    }
  }

  // Mobile: Handle pasta selection from modal
  const handleMobilePastaSelect = (name: string, cookingTime: number) => {
    if (newlyAddedTrayId) {
      handleAddPasta(newlyAddedTrayId, {
        name,
        cookingTime,
        trayType: pendingTrayType || 'regular'
      })
      setPendingTrayType(null)
      setNewlyAddedTrayId(null)
    }
  }

  const handleAddPasta = (trayId: string, pasta: Omit<Pasta, 'id' | 'startTime'>) => {
    setTrays(trays.map(tray => {
      if (tray.id === trayId) {
        const maxPastaCount = tray.type === 'large' ? 2 : tray.type === 'extraLarge' ? 6 : 1
        if (tray.pastas.length >= maxPastaCount) {
          return tray
        }
        return {
          ...tray,
          pastas: [...tray.pastas, {
            ...pasta,
            id: `pasta-${Date.now()}-${Math.random()}`,
            startTime: Date.now()
          }]
        }
      }
      return tray
    }))
  }

  const handleRemoveTray = (trayId: string) => {
    setTrays(trays.filter(tray => tray.id !== trayId))
  }

  const handleRemovePasta = (trayId: string, pastaId: string) => {
    setTrays(trays.map(tray => {
      if (tray.id === trayId) {
        return {
          ...tray,
          pastas: tray.pastas.filter(p => p.id !== pastaId)
        }
      }
      return tray
    }))
  }

  // Extended canPlaceTray that can exclude multiple trays
  const canPlaceTrayWithExclusions = (startPosition: number, size: number, excludeTrayIds: string[]): boolean => {
    if (size === 4) {
      const validStarts = getValidExtraLargeStartPositions()
      
      // Start position must be a valid 2x2 block start
      if (!validStarts.includes(startPosition)) {
        return false
      }
      
      const blockPositions = calculate2x2BlockPositions(startPosition)
      
      if (blockPositions.some(pos => pos < 0 || pos > 7)) {
        return false
      }
      
      const occupiedPositions = new Set<number>()
      trays.forEach(tray => {
        if (!excludeTrayIds.includes(tray.id)) {
          tray.positions.forEach(pos => occupiedPositions.add(pos))
        }
      })
      
      for (const pos of blockPositions) {
        if (occupiedPositions.has(pos)) {
          return false
        }
      }
      
      return true
    }

    if (startPosition < 0 || startPosition > 7) return false

    const occupiedPositions = new Set<number>()
    trays.forEach(tray => {
      if (!excludeTrayIds.includes(tray.id)) {
        tray.positions.forEach(pos => occupiedPositions.add(pos))
      }
    })

    return !occupiedPositions.has(startPosition)
  }

  // Helper to calculate positions a tray would occupy
  const calculateTrayPositions = (startPosition: number, size: number): number[] => {
    if (size === 4) {
      return calculate2x2BlockPositions(startPosition)
    }
    return [startPosition]
  }

  // Find swap options when trying to move a tray to an occupied position
  // Now handles MULTIPLE blocking trays
  const findSwapOption = (
    draggingTrayId: string, 
    targetPosition: number
  ): { displacedTrays: Array<{ trayId: string; newPosition: number }> } | null => {
    const draggingTray = trays.find(t => t.id === draggingTrayId)
    if (!draggingTray) return null

    const draggingSize = getTraySize(draggingTray.type)
    
    // Calculate positions the dragging tray would occupy
    let dragTargetPositions: number[] = []
    if (draggingSize === 4) {
      // For extra large, need a valid 2x2 start position
      const col = targetPosition % 4
      const possibleStarts: number[] = []
      for (let startCol = 0; startCol <= 2; startCol++) {
        if (col >= startCol && col <= startCol + 1) {
          possibleStarts.push(startCol)
        }
      }
      
      for (const startPos of possibleStarts) {
        dragTargetPositions = [startPos, startPos + 1, startPos + 4, startPos + 5]
        break // Use first valid start
      }
      
      if (dragTargetPositions.length === 0) return null
    } else {
      dragTargetPositions = [targetPosition]
    }

    // Find ALL trays that would be displaced
    const displacedTrayIds = new Set<string>()
    for (const pos of dragTargetPositions) {
      const trayAtPos = trays.find(t => t.id !== draggingTrayId && t.positions.includes(pos))
      if (trayAtPos) {
        displacedTrayIds.add(trayAtPos.id)
      }
    }

    if (displacedTrayIds.size === 0) return null

    const displacedTrays = Array.from(displacedTrayIds).map(id => trays.find(t => t.id === id)!)
    
    // Calculate which positions will be freed by the dragging tray
    const freedPositions = draggingTray.positions
    
    // Try to find valid positions for ALL displaced trays
    // We need to assign each displaced tray a new position that:
    // 1. Doesn't overlap with dragTargetPositions
    // 2. Doesn't overlap with other trays (except dragging tray and other displaced trays)
    // 3. Doesn't overlap with positions assigned to other displaced trays
    
    const result: Array<{ trayId: string; newPosition: number }> = []
    const assignedPositions = new Set<number>()
    
    // Add dragTargetPositions to assigned (these are taken by dragging tray)
    dragTargetPositions.forEach(p => assignedPositions.add(p))
    
    // Sort displaced trays by size (larger first - harder to place)
    const sortedDisplacedTrays = [...displacedTrays].sort((a, b) => 
      getTraySize(b.type) - getTraySize(a.type)
    )
    
    for (const displacedTray of sortedDisplacedTrays) {
      const displacedSize = getTraySize(displacedTray.type)
      let foundPosition = false
      
      // Get all tray IDs to exclude (dragging + all displaced)
      const excludeIds = [draggingTrayId, ...displacedTrays.map(t => t.id)]
      
      // Try positions, prioritizing freed positions
      const positionsToTry = displacedSize === 4 
        ? [0, 1, 2] // Extra large start positions
        : [0, 1, 2, 3, 4, 5, 6, 7]
      
      // Sort to prefer freed positions first
      positionsToTry.sort((a, b) => {
        const aIsFreed = freedPositions.includes(a)
        const bIsFreed = freedPositions.includes(b)
        if (aIsFreed && !bIsFreed) return -1
        if (!aIsFreed && bIsFreed) return 1
        return 0
      })
      
      for (const tryPos of positionsToTry) {
        // Check if position is valid (not occupied by non-displaced trays)
        if (!canPlaceTrayWithExclusions(tryPos, displacedSize, excludeIds)) {
          continue
        }
        
        // Calculate what positions this tray would take
        const wouldOccupy = calculateTrayPositions(tryPos, displacedSize)
        
        // Check if any of these positions are already assigned
        const hasConflict = wouldOccupy.some(p => assignedPositions.has(p))
        if (hasConflict) {
          continue
        }
        
        // This position works!
        result.push({ trayId: displacedTray.id, newPosition: tryPos })
        wouldOccupy.forEach(p => assignedPositions.add(p))
        foundPosition = true
        break
      }
      
      if (!foundPosition) {
        // Can't find a valid position for this tray - swap not possible
        return null
      }
    }
    
    return { displacedTrays: result }
  }

  const handleMoveTray = (trayId: string, newStartPosition: number) => {
    const tray = trays.find(t => t.id === trayId)
    if (!tray) return

    const size = getTraySize(tray.type)
    
    // Check if the new position is valid (excluding this tray's current positions)
    if (!canPlaceTray(newStartPosition, size, trayId)) {
      return
    }

    // Calculate new positions
    const newPositions: number[] = []
    if (size === 4) {
      newPositions.push(...calculate2x2BlockPositions(newStartPosition))
    } else {
      newPositions.push(newStartPosition)
    }

    // Update the tray with new positions
    setTrays(trays.map(t => {
      if (t.id === trayId) {
        return { ...t, positions: newPositions }
      }
      return t
    }))
  }

  // Handle swap operation - move dragging tray and ALL displaced trays simultaneously
  const handleSwapTrays = (
    draggingTrayId: string, 
    newDraggingPosition: number, 
    displacedTrays: Array<{ trayId: string; newPosition: number }>
  ) => {
    const draggingTray = trays.find(t => t.id === draggingTrayId)
    if (!draggingTray) return

    const draggingSize = getTraySize(draggingTray.type)

    // Calculate new positions for dragging tray
    const newDraggingPositions = calculateTrayPositions(newDraggingPosition, draggingSize)

    // Build a map of tray ID to new positions
    const newPositionsMap = new Map<string, number[]>()
    newPositionsMap.set(draggingTrayId, newDraggingPositions)
    
    for (const displaced of displacedTrays) {
      const displacedTray = trays.find(t => t.id === displaced.trayId)
      if (displacedTray) {
        const displacedSize = getTraySize(displacedTray.type)
        const newPositions = calculateTrayPositions(displaced.newPosition, displacedSize)
        newPositionsMap.set(displaced.trayId, newPositions)
      }
    }

    // Update all affected trays in one state update
    setTrays(trays.map(t => {
      const newPositions = newPositionsMap.get(t.id)
      if (newPositions) {
        return { ...t, positions: newPositions }
      }
      return t
    }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍝 Pasta Cook Timer</h1>
        <p>Manage your pasta cooking with precision</p>
      </header>

      <div className="app-controls">
        <TrayDropdown
          selectedType={selectedTrayType}
          onSelectType={setSelectedTrayType}
        />
      </div>

      <div className="app-content">
        <div className="sink-container">
          <Sink
            trays={trays}
            onPlaceTray={handlePlaceTray}
            onMobilePositionTap={handleMobilePositionTap}
            onRemoveTray={handleRemoveTray}
            onRemovePasta={handleRemovePasta}
            onMoveTray={handleMoveTray}
            onSwapTrays={handleSwapTrays}
            selectedTrayType={selectedTrayType}
            getTraySize={getTraySize}
            canPlaceTray={canPlaceTray}
            findSwapOption={findSwapOption}
          />
        </div>

        {/* Mobile Modals */}
        <MobileTrayModal
          isOpen={showTrayModal}
          onClose={() => {
            setShowTrayModal(false)
            setPendingTrayPosition(null)
          }}
          onSelectTrayType={handleMobileTraySelect}
        />
        <MobilePastaModal
          isOpen={showPastaModal}
          onClose={() => {
            setShowPastaModal(false)
            setPendingTrayType(null)
          }}
          onSelectPasta={handleMobilePastaSelect}
          trayType={pendingTrayType || 'regular'}
        />

        <div className="right-panel">
          <PastaForm
            trays={trays}
            onAddPasta={handleAddPasta}
            autoSelectTrayId={newlyAddedTrayId || undefined}
          />
        </div>
      </div>
    </div>
  )
}

export default App

