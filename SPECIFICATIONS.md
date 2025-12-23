# Pasta Cook Timer - Specifications & Project Context

## 📋 Overview

**Pasta Cook Timer** is a visual pasta cooking management application designed for commercial kitchen environments. It provides a top-down view of a boiling water sink with 8 cooking positions, allowing kitchen staff to track multiple pasta orders simultaneously with precision timing.

**Live Application**: [https://akashmdbuda-droid.github.io/2Spaghi-kitchen/](https://akashmdbuda-droid.github.io/2Spaghi-kitchen/)

### Key Features
- ✅ **Mobile-First Design**: Optimized for tablets and mobile devices
- ✅ **Visual Pasta Selector**: Image-based pasta type selection with preset cooking times
- ✅ **Touch-Optimized**: Smooth drag and drop for mobile devices
- ✅ **Portrait Layout**: 2×4 grid layout on mobile for better space utilization
- ✅ **Auto-Selection**: Newly added trays automatically selected for pasta input
- ✅ **PWA-Ready**: Installable as a Progressive Web App
- ✅ **GitHub Pages Deployment**: Automatically deployed on every push

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
- **Visual Pasta Selector**: Choose from preset pasta types with images
  - Spaghetti (4:00)
  - Tagliatelle (2:00)
  - Sedanini (1:30)
  - Casarecho (3:00)
  - Fusilli (2:00)
  - Bucatini (3:00)
  - Ravioli types (Brasato, Black Truffle, Spinach) - 4:00 to 10:00 range
- Add pasta to any tray with preset or custom name and cooking time
- **Auto-Selection**: When a tray is placed, it's automatically selected in the pasta form
- Real-time countdown display (MM:SS format)
- Visual progress bar
- Completion alert with animation ("DONE! 🎉")
- **Ravioli Special Handling**: Time range validation (4-10 minutes)

#### 3. Drag & Drop Rearrangement
- **Desktop**: Mouse drag and drop with HTML5 API
- **Mobile/Tablet**: Touch-based drag and drop
  - Long-press tray handle to start drag
  - Smooth touch interactions with haptic feedback
  - Improved sensitivity (8px threshold)
  - Visual feedback during drag
- Drag trays to new positions
- Visual drop preview (purple highlight)
- Collision detection prevents invalid placements
- Maintains pasta timers during moves
- **Portrait Layout Support**: 2x2 blocks adapt to portrait orientation on mobile

#### 4. Space Optimization
- Visual indicators show available positions
- Capacity indicators on trays
- Smart blocking prevents overlapping placements

### User Interface

#### Top Controls
- **Tray Type Dropdown**: Choose tray type (Regular, Large, Extra Large) - displayed as dropdown at top

#### Main Area (Sink)
- **8-Position Grid**: Visual representation of cooking sink
  - **Desktop**: 4 columns × 2 rows (landscape)
  - **Mobile/Tablet**: 2 columns × 4 rows (portrait) for better space utilization
- **Tray Cards**: Display tray info, pastas, and timers
- **Position Numbers**: Show available slot numbers
- **Touch Support**: Optimized drag and drop for mobile devices

#### Right Panel (Desktop) / Bottom Panel (Mobile)
- **Pasta Form**: Add pasta with visual type selector
  - **Pasta Type Cards**: Visual selector with images for each pasta type
  - **Preset Cooking Times**: Default times for common pasta types
  - **Auto-Selection**: Newly added trays are automatically selected
  - **Custom Input**: Can still enter custom pasta names and times

---

## 📊 Data Models

### Pasta Interface
```typescript
interface Pasta {
  id: string              // Unique identifier
  name: string            // Pasta type (e.g., "Spaghetti", "Ravioli - Brasato")
  cookingTime: number     // Total cooking time in seconds
  startTime: number       // Unix timestamp when started
  trayType: 'regular' | 'large' | 'extraLarge'
}
```

### Pasta Preset Interface
```typescript
interface PastaPreset {
  name: string            // Pasta name
  cookingTime: number     // Default cooking time in seconds
  category?: string       // Optional category (e.g., "ravioli")
  imageUrl?: string       // Image URL for visual selector
  emoji?: string          // Fallback emoji icon
}
```

### Supported Pasta Types
- **Regular Pasta**: spaghetti, tagliatelle, sedanini, casarecho, fusilli, bucatini
- **Ravioli**: brasato, black truffle, spinach (4-10 minute range)

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
| Hosting | GitHub Pages |
| Deployment | GitHub Actions (CI/CD) |

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Real-time timer updates (1-second intervals)
- Efficient re-renders using React state
- Drag & drop with native HTML5 API and touch events
- Optimized for mobile devices
- PWA-ready (Progressive Web App)

---

## 📁 Project Structure

```
pasta-cook/
├── public/
│   ├── vite.svg
│   └── manifest.json         # PWA manifest
├── src/
│   ├── components/
│   │   ├── Sink.tsx          # Main sink grid component
│   │   ├── Sink.css          # Sink styling (portrait/landscape)
│   │   ├── TrayDropdown.tsx  # Tray type dropdown selector
│   │   ├── TrayDropdown.css  # Dropdown styling
│   │   ├── TraySelector.tsx  # Legacy tray selector (optional)
│   │   ├── TraySelector.css  # Legacy selector styling
│   │   ├── PastaForm.tsx     # Add pasta form with visual selector
│   │   └── PastaForm.css     # Form styling with pasta cards
│   ├── data/
│   │   └── pastaPresets.ts   # Pasta type presets with images
│   ├── App.tsx               # Main application component
│   ├── App.css               # App layout styling
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json               # Vercel deployment config
├── netlify.toml              # Netlify deployment config
├── README.md
├── SPECIFICATIONS.md
└── DEPLOYMENT.md             # Deployment guide
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
   - Click dropdown at top to choose tray type (Regular, Large, Extra Large)

2. **Place Tray**
   - **Desktop**: Hover over sink to see placement preview, then click
   - **Mobile**: Tap empty sink positions to place tray
   - Tray is automatically selected for pasta input

3. **Add Pasta**
   - **Visual Selector**: Click pasta type card (with image) from preset options
   - **Or Custom**: Type custom pasta name
   - Cooking time auto-fills from preset (can be adjusted)
   - **Ravioli**: Time range is 4-10 minutes (validated)
   - Click "Start Cooking 🍝"

4. **Monitor Cooking**
   - Watch countdown timers (MM:SS format)
   - Progress bars show completion percentage
   - "DONE! 🎉" appears when finished with pulse animation

5. **Rearrange (if needed)**
   - **Desktop**: Drag tray by handle (⋮⋮) to new position
   - **Mobile**: Long-press tray handle, then drag to new position
   - Visual preview shows valid drop zones

6. **Remove**
   - Click × on tray to remove entire tray
   - Click × on pasta item to remove single pasta

---

## 📈 Future Enhancements

### Planned Features
- [ ] Sound alerts when pasta is done
- [x] Preset pasta types with default cooking times ✅
- [ ] History/logging of cooked orders
- [ ] Multiple sink support
- [ ] Dark mode theme
- [x] Mobile responsive design ✅
- [ ] Export/import configurations
- [ ] Integration with POS systems
- [ ] Database integration for persistence
- [ ] Multi-user support with real-time sync

### Potential Improvements
- WebSocket support for multi-device sync
- Push notifications
- Voice commands
- Barcode/QR scanning for orders
- Custom pasta image uploads
- Recipe suggestions based on pasta type
- Kitchen analytics dashboard

## 🚀 Deployment

### Current Deployment
- **Platform**: GitHub Pages
- **URL**: https://akashmdbuda-droid.github.io/2Spaghi-kitchen/
- **CI/CD**: GitHub Actions (automatic deployment on push to `main`)
- **Build**: Automated via GitHub Actions workflow

### Deployment Options
- ✅ GitHub Pages (Current)
- Vercel (configured)
- Netlify (configured)
- Manual deployment (any static host)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📱 Mobile & Tablet Support

### Responsive Design
- **Mobile Portrait**: 2 columns × 4 rows sink layout
- **Tablet**: Adaptive layout
- **Desktop**: 4 columns × 2 rows sink layout

### Touch Optimizations
- Touch-friendly drag and drop
- Larger touch targets (minimum 44px)
- Haptic feedback on drag start
- Smooth touch interactions
- Prevented accidental zoom
- PWA-ready for installation

### PWA Features
- Installable on mobile devices
- Works offline (basic)
- App-like experience
- Manifest configured

---

## 📄 License

MIT License - Free for commercial and personal use.

---

## 🎯 Recent Updates

### Version 2.0 Features (Latest)
- **Mobile Optimization**: Portrait layout (2×4 grid) for mobile devices
- **Visual Pasta Selector**: Image cards with preset cooking times
- **Touch Drag & Drop**: Improved mobile interaction with haptic feedback
- **Tray Dropdown**: Clean dropdown selector at top instead of side panel
- **Auto-Selection**: Trays auto-select when placed for faster workflow
- **Ravioli Support**: Special handling for ravioli types with time range (4-10 mins)
- **GitHub Pages Deployment**: Automated CI/CD deployment

### Version 1.0 Features (Initial)
- Basic sink visualization
- Tray placement and management
- Timer functionality
- Drag and drop rearrangement

---

*Built with ❤️ for efficient kitchen operations*

**Deployed on**: GitHub Pages | **Repository**: [GitHub](https://github.com/akashmdbuda-droid/2Spaghi-kitchen)


