# Project Context - Pasta Cook Timer

> Quick reference for developers working on this codebase

## 🎯 What This App Does

A **visual pasta cooking timer** for commercial kitchens. Staff place virtual trays in an 8-position sink grid and track multiple pasta cooking times simultaneously.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  • Global state (trays, selected type)                       │
│  • Tray placement logic                                      │
│  • 2×2 block calculations for layouts                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │  TrayDropdown    │  │            Sink.tsx              │  │
│  │  - Type selector │  │  • 8-position grid               │  │
│  └──────────────────┘  │  • @dnd-kit drag & drop          │  │
│                        │  • Tray rendering                 │  │
│  ┌──────────────────┐  │  • Timer countdown               │  │
│  │  PastaForm       │  │  • Swap/drop preview logic       │  │
│  │  - Add pasta     │  └─────────────────────────────────┘  │
│  │  - Visual select │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📐 Grid Layouts

### Desktop (4 columns × 2 rows)
```
Position indices:  0  1  2  3
                   4  5  6  7

2×2 block for index 0: [0, 1, 4, 5]  (horizontal pairs)
Valid XL starts: [0, 1, 2]
```

### Mobile Portrait (2 columns × 4 rows)
```
Position indices:  0  1
                   2  3
                   4  5
                   6  7

2×2 block for index 0: [0, 1, 2, 3]  (sequential)
Valid XL starts: [0, 2, 4]
```

## 🔑 Key Functions

### `calculate2x2BlockPositions(start)` in App.tsx
Returns the 4 positions covered by an extra-large tray:
- Desktop: `[start, start+1, start+4, start+5]`
- Mobile: `[start, start+1, start+2, start+3]`

### `getValidExtraLargeStartPositions()` in App.tsx
Returns valid start positions for extra-large trays:
- Desktop: `[0, 1, 2]`
- Mobile: `[0, 2, 4]`

### `canPlaceTray(position, size, excludeTrayId)` in App.tsx
Checks if a tray can be placed at a position.

## 🎮 Drag & Drop (@dnd-kit)

### Components in Sink.tsx:
- **`DndContext`**: Wraps the entire sink
- **`DroppablePosition`**: Each grid cell is a droppable zone
- **`DraggableTray`**: Each tray is draggable
- **`DragOverlay`**: Shows floating tray during drag

### Key Handlers:
```typescript
handleDragStart  → Sets activeTray
handleDragOver   → Calculates dropPreview, swapPreview
handleDragEnd    → Moves tray to new position
```

### Collision Detection:
- Uses `closestCenter` algorithm
- Droppables are disabled for positions covered by extra-large trays
- Exception: Not disabled when dragging the covering tray itself

## 📱 Responsive Breakpoint

```css
@media (max-width: 768px) {
  /* Mobile portrait: 2×4 grid */
}
```

Detection in TypeScript:
```typescript
const isMobilePortrait = window.innerWidth <= 768
```

## 🎨 Visual States

| State | CSS Class | Description |
|-------|-----------|-------------|
| Empty cell | `.sink-position` | Blue gradient |
| Occupied | `.occupied` | Green gradient |
| Hover preview | `.preview` | Yellow border |
| Drop preview | `.drop-preview` | Green border |
| Swap target | `.swap-drag-target` | Purple border |
| Dragging | `.dragging` | Reduced opacity |

## 📦 Data Models

```typescript
interface Tray {
  id: string
  type: 'regular' | 'large' | 'extraLarge'
  positions: number[]  // [0], [0], or [0,1,2,3] for XL
  pastas: Pasta[]
}

interface Pasta {
  id: string
  name: string
  cookingTime: number  // seconds
  startTime: number    // Unix timestamp
  trayType: 'regular' | 'large' | 'extraLarge'
}
```

## 🐛 Common Issues

### 1. Extra-large tray not showing 2×2 preview
**Check:** `calculate2x2BlockPositions()` returns correct positions for current layout

### 2. Droppables not responding
**Check:** `isDisabledDroppable` logic in render - covered positions should be disabled except when dragging the covering tray

### 3. Trays overlapping
**Check:** Collision detection in `handleDragEnd` - ensure `canPlaceTray` is called with correct parameters

## 🚀 Quick Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📁 File Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Main state, tray logic |
| `Sink.tsx` | Grid rendering, drag & drop |
| `Sink.css` | Grid styles, responsive layout |
| `PastaForm.tsx` | Add pasta interface |
| `TrayDropdown.tsx` | Tray type selector |
| `pastaPresets.ts` | Pasta types with cooking times |

---

*See [SPECIFICATIONS.md](./SPECIFICATIONS.md) for full documentation*

