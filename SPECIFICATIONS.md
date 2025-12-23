# Pasta Cook Timer - Specifications & Project Context

## 📋 Overview

**Pasta Cook Timer** is a visual pasta cooking management application designed for commercial kitchen environments. It provides a top-down view of a boiling water sink with 8 cooking positions, allowing kitchen staff to track multiple pasta orders simultaneously with precision timing.

---

## 🎯 Project Context

### Problem Statement
In busy commercial kitchens (restaurants, cafeterias, food courts), managing multiple pasta cooking times simultaneously is challenging. Kitchen staff need to:
- Track different pasta types with varying cooking times
- Optimize sink space utilization
- Avoid overcooking or undercooking
- Handle multiple orders efficiently

### Solution
A visual, interactive timer application that simulates a real pasta cooking sink, allowing staff to:
- Virtually place pasta trays in a sink
- Track individual cooking times with visual progress indicators
- Receive alerts when pasta is done
- Rearrange trays to optimize space usage

---

## 🏗️ System Architecture

### Grid Layout
```
┌─────────────────────────────────┐
│      BOILING WATER SINK         │
├────────┬────────┬────────┬──────┤
│   1    │   2    │   3    │   4  │  ← Row 1 (indices 0-3)
├────────┼────────┼────────┼──────┤
│   5    │   6    │   7    │   8  │  ← Row 2 (indices 4-7)
└────────┴────────┴────────┴──────┘
         8 Total Positions
```

### Position Indexing
| Display Position | Array Index | Grid Location |
|-----------------|-------------|---------------|
| 1 | 0 | Row 1, Col 1 |
| 2 | 1 | Row 1, Col 2 |
| 3 | 2 | Row 1, Col 3 |
| 4 | 3 | Row 1, Col 4 |
| 5 | 4 | Row 2, Col 1 |
| 6 | 5 | Row 2, Col 2 |
| 7 | 6 | Row 2, Col 3 |
| 8 | 7 | Row 2, Col 4 |

---

## 🍝 Tray Types

### 1. Regular Tray
| Property | Value |
|----------|-------|
| Positions Occupied | 1 |
| Pasta Capacity | 1 |
| Use Case | Single portion orders |
| Color Code | Blue border |

### 2. Large Tray
| Property | Value |
|----------|-------|
| Positions Occupied | 1 |
| Pasta Capacity | 2 |
| Use Case | Double portion or 2 different pasta types |
| Color Code | Purple border |

### 3. Extra Large Tray
| Property | Value |
|----------|-------|
| Positions Occupied | 4 (2×2 block) |
| Pasta Capacity | 6 |
| Use Case | Bulk orders, family servings |
| Color Code | Red border |

#### Extra Large Tray Valid Placements
```
Configuration A:        Configuration B:        Configuration C:
┌────┬────┬────┬────┐   ┌────┬────┬────┬────┐   ┌────┬────┬────┬────┐
│ ██ │ ██ │    │    │   │    │ ██ │ ██ │    │   │    │    │ ██ │ ██ │
├────┼────┼────┼────┤   ├────┼────┼────┼────┤   ├────┼────┼────┼────┤
│ ██ │ ██ │    │    │   │    │ ██ │ ██ │    │   │    │    │ ██ │ ██ │
└────┴────┴────┴────┘   └────┴────┴────┴────┘   └────┴────┴────┴────┘
Positions: 1,2,5,6      Positions: 2,3,6,7      Positions: 3,4,7,8
Start Index: 0          Start Index: 1          Start Index: 2
```

---

## ⚙️ Features

### Core Features

#### 1. Tray Placement
- Select tray type from left panel
- Click on empty sink positions to place
- Visual preview shows placement area on hover
- Smart placement for extra-large trays (finds valid 2×2 blocks)

#### 2. Pasta Timer Management
- Add pasta to any tray with custom name and cooking time
- Real-time countdown display (MM:SS format)
- Visual progress bar
- Completion alert with animation ("DONE! 🎉")

#### 3. Drag & Drop Rearrangement
- Drag trays to new positions
- Visual drop preview (purple highlight)
- Collision detection prevents invalid placements
- Maintains pasta timers during moves

#### 4. Space Optimization
- Visual indicators show available positions
- Capacity indicators on trays
- Smart blocking prevents overlapping placements

### User Interface

#### Left Panel
- **Tray Selector**: Choose tray type (Regular, Large, Extra Large)
- **Pasta Form**: Add pasta with name and cooking time

#### Main Area (Sink)
- **8-Position Grid**: Visual representation of cooking sink
- **Tray Cards**: Display tray info, pastas, and timers
- **Position Numbers**: Show available slot numbers

---

## 📊 Data Models

### Pasta Interface
```typescript
interface Pasta {
  id: string              // Unique identifier
  name: string            // Pasta type (e.g., "Spaghetti")
  cookingTime: number     // Total cooking time in seconds
  startTime: number       // Unix timestamp when started
  trayType: 'regular' | 'large' | 'extraLarge'
}
```

### Tray Interface
```typescript
interface Tray {
  id: string              // Unique identifier
  type: 'regular' | 'large' | 'extraLarge'
  positions: number[]     // Array of occupied position indices
  pastas: Pasta[]         // Array of pastas in this tray
}
```

---

## 🎨 Visual Design

### Color Scheme
| Element | Color | Hex Code |
|---------|-------|----------|
| Empty Position | Light Blue | `#e0f2fe` → `#bae6fd` |
| Occupied Position | Light Green | `#d1fae5` → `#a7f3d0` |
| Preview (New Tray) | Yellow | `#fef3c7` → `#fde68a` |
| Drop Preview | Purple | `#c7d2fe` → `#a5b4fc` |
| Regular Tray Border | Blue | `#3b82f6` |
| Large Tray Border | Purple | `#8b5cf6` |
| Extra Large Tray Border | Red | `#ef4444` |
| Timer Done | Orange/Yellow | `#fef3c7` |

### Animations
- **Hover**: Scale up (1.05x) with shadow
- **Done Pulse**: Opacity pulse animation (2s infinite)
- **Drag**: Opacity reduction (0.3) with dashed border

---

## 🔧 Technical Specifications

### Technology Stack
| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite 5 |
| Styling | CSS3 (Custom) |
| State Management | React useState |

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance
- Real-time timer updates (1-second intervals)
- Efficient re-renders using React state
- Drag & drop with native HTML5 API

---

## 📁 Project Structure

```
pasta-cook/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Sink.tsx          # Main sink grid component
│   │   ├── Sink.css          # Sink styling
│   │   ├── TraySelector.tsx  # Tray type selection
│   │   ├── TraySelector.css  # Tray selector styling
│   │   ├── PastaForm.tsx     # Add pasta form
│   │   └── PastaForm.css     # Form styling
│   ├── App.tsx               # Main application component
│   ├── App.css               # App layout styling
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── SPECIFICATIONS.md
```

---

## 🚀 Usage Guide

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Workflow

1. **Select Tray Type**
   - Click on desired tray type in left panel

2. **Place Tray**
   - Hover over sink to see placement preview
   - Click to place tray

3. **Add Pasta**
   - Select tray from dropdown
   - Enter pasta name
   - Set cooking time (minutes and seconds)
   - Click "Start Cooking"

4. **Monitor Cooking**
   - Watch countdown timers
   - Progress bars show completion percentage
   - "DONE!" appears when finished

5. **Rearrange (if needed)**
   - Drag tray by the handle (⋮⋮)
   - Drop in new valid position

6. **Remove**
   - Click × on tray to remove entire tray
   - Click × on pasta item to remove single pasta

---

## 📈 Future Enhancements

### Planned Features
- [ ] Sound alerts when pasta is done
- [ ] Preset pasta types with default cooking times
- [ ] History/logging of cooked orders
- [ ] Multiple sink support
- [ ] Dark mode theme
- [ ] Mobile responsive design
- [ ] Export/import configurations
- [ ] Integration with POS systems

### Potential Improvements
- WebSocket support for multi-device sync
- Push notifications
- Voice commands
- Barcode/QR scanning for orders

---

## 📄 License

MIT License - Free for commercial and personal use.

---

*Built with ❤️ for efficient kitchen operations*

