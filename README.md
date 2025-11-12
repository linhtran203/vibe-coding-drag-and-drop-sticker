# Drag and Drop Application

A Next.js application with TypeScript and Shadcn UI that allows users to drag elements from a sidebar and drop them onto a canvas with resizable functionality.

## Features

- ✨ Drag elements from sidebar to canvas
- 📍 Drop elements anywhere on the canvas
- 🔄 Resize images with corner handles (constrained between 30px and 100px)
- 🎨 Clean UI without title labels or borders on dropped elements
- 🖼️ Support for multiple image elements

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add your images to the `public/images/` directory:
   - `milk-bottle.jpg`
   - `receipt.jpg`
   - `snoopy-card.jpg`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Drag**: Click and drag any element from the left sidebar
2. **Drop**: Release the element anywhere on the canvas area
3. **Resize**: Hover over a dropped element to see resize handles at the corners
4. **Adjust Size**: Click and drag any corner handle to resize (min: 30px, max: 100px)

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── card.tsx
│   │   └── DragAndDropCanvas.tsx
│   └── lib/
│       └── utils.ts
├── public/
│   └── images/
│       ├── milk-bottle.jpg
│       ├── receipt.jpg
│       └── snoopy-card.jpg
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Adding New Elements

To add new draggable elements, edit the `ELEMENTS` array in `src/components/DragAndDropCanvas.tsx`:

```typescript
const ELEMENTS = [
  {
    id: "your-element",
    name: "Your Element Name",
    src: "/images/your-image.jpg",
  },
  // ... more elements
];
```

### Adjusting Size Limits

Modify the constants at the top of `DragAndDropCanvas.tsx`:

```typescript
const MIN_SIZE = 30; // Minimum size in pixels
const MAX_SIZE = 100; // Maximum size in pixels
```

## License

MIT
# vibe-coding-drag-and-drop-sticker
