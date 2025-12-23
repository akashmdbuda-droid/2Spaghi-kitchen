# 🍝 Pasta Cook Timer

A visual pasta cooking management application for commercial kitchens. Track multiple pasta orders with precision timing using an intuitive top-down sink visualization.

![Pasta Cook Timer](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## ✨ Features

- **Visual Sink Interface** - Top-down view of 8-position boiling water sink
- **Multiple Tray Types**:
  - 🍝 **Regular** - 1 position, 1 pasta
  - 🍜 **Large** - 1 position, 2 pastas  
  - 🍲 **Extra Large** - 4 positions (2×2), 6 pastas
- **Real-time Timers** - Countdown with progress bars
- **Drag & Drop** - Rearrange trays to optimize space
- **Visual Feedback** - Hover previews, completion animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 How to Use

### 1. Place a Tray
1. Select tray type from the left panel
2. Hover over the sink to see placement preview
3. Click to place the tray

### 2. Add Pasta
1. Select a tray from the dropdown
2. Enter pasta name (e.g., "Spaghetti")
3. Set cooking time
4. Click "Start Cooking 🍝"

### 3. Monitor & Manage
- Watch countdown timers and progress bars
- "DONE! 🎉" appears when cooking is complete
- Drag trays to rearrange
- Click × to remove trays or pasta

## 🗂️ Sink Layout

```
┌─────┬─────┬─────┬─────┐
│  1  │  2  │  3  │  4  │
├─────┼─────┼─────┼─────┤
│  5  │  6  │  7  │  8  │
└─────┴─────┴─────┴─────┘
      8 Positions Total
```

### Extra Large Tray Placements
The extra-large tray requires a 2×2 block and can be placed in 3 configurations:
- **Left**: Positions 1, 2, 5, 6
- **Center**: Positions 2, 3, 6, 7
- **Right**: Positions 3, 4, 7, 8

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CSS3** - Styling with gradients and animations

## 📁 Project Structure

```
src/
├── components/
│   ├── Sink.tsx           # Main sink visualization
│   ├── TraySelector.tsx   # Tray type selection
│   └── PastaForm.tsx      # Add pasta form
├── App.tsx                # Main app component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## 📋 Documentation

See [SPECIFICATIONS.md](./SPECIFICATIONS.md) for detailed technical specifications, data models, and feature documentation.

## 📄 License

MIT License - Free for commercial and personal use.

---

*Built for efficient kitchen operations* 🍳
