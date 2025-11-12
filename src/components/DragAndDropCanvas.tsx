"use client";

import { useState, useRef, useEffect, DragEvent, MouseEvent } from "react";
import { Card } from "@/components/ui/card";

interface DroppedElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
}

interface ResizeHandle {
  elementId: string;
  corner: string;
}

interface DraggingElement {
  elementId: string;
  offsetX: number;
  offsetY: number;
}

interface RotatingElement {
  elementId: string;
  startAngle: number;
  centerX: number;
  centerY: number;
}

const ELEMENTS = [
  {
    id: "snoopy-card",
    name: "Snoopy Card",
    src: "/images/a.png",
  },
  {
    id: "receipt",
    name: "Receipt",
    src: "/images/b.png",
  },
  {
    id: "milk-bottle",
    name: "Milk Bottle",
    src: "/images/c.png",
  },
];

const MIN_SIZE = 30;
const MAX_SIZE = 500;
const STORAGE_KEY = 'drag-and-drop-custom-images';
const CANVAS_STATE_KEY = 'drag-and-drop-canvas-state';

const CUTE_EMOJIS = [
  "😊", "🥰", "😍", "🤗", "😘", "😚", "😙", "🥲", "😇", "🙂", "🙃", "😉", "😌", "😋",
  "😛", "😝", "😜", "🤪", "🥳", "🤩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿",
  "😾", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸",
  "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
  "🐝", "🐛", "🦋", "🐌", "🐞", "🐢", "🦎", "🦕", "🦖", "🐙", "🦑", "🦐", "🦀", "🐡",
  "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛",
  "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙",
  "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩",
  "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🌸", "🌺", "🌻",
  "🌷", "🌹", "🥀", "🏵️", "💐", "🌼", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂",
  "🍃", "🌱", "🪴", "🌳", "🌲", "🌰", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥",
  "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄",
  "🌬️", "💨", "💧", "💦", "☔", "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
  "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑",
  "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚",
  "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓",
  "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🍝", "🍜", "🍲", "🍛", "🍣",
  "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨",
  "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜",
  "🍯", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃",
  "🥤", "🧋", "🧃", "🧉", "🧊", "🎀", "🎁", "🎈", "🎉", "🎊", "🎋", "🎍", "🎎", "🎏",
  "🎐", "🎑", "🧧", "🎀", "🎁", "🎗️", "🎟️", "🎫", "🏆", "🏅", "🥇", "🥈", "🥉", "⚽",
  "⚾", "🥎", "🏀", "🏐", "🏈", "🏉", "🎾", "🥏", "🎳", "🏏", "🏑", "🏒", "🥍", "🏓",
  "🏸", "🥊", "🥋", "🥅", "⛳", "⛸️", "🎣", "🤿", "🎽", "🎿", "🛷", "🥌", "💝", "💖",
  "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎",
  "🖤", "🤍", "♥️", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💬", "👁️‍🗨️", "🗨️", "🗯️",
  "💭", "💤"
];

const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Oswald",
  "Source Sans Pro",
  "Raleway",
  "Poppins",
  "Merriweather",
  "PT Sans",
  "Playfair Display",
  "Dancing Script",
  "Pacifico",
  "Bebas Neue",
  "Lobster",
  "Indie Flower",
  "Permanent Marker",
  "Caveat",
  "Great Vibes",
  "Be Vietnam Pro",
  "Inter",
  "Ubuntu",
  "Noto Sans",
  "Nunito",
];

export default function DragAndDropCanvas() {
  const [droppedElements, setDroppedElements] = useState<DroppedElement[]>([]);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [resizing, setResizing] = useState<ResizeHandle | null>(null);
  const [draggingElement, setDraggingElement] = useState<DraggingElement | null>(null);
  const [rotatingElement, setRotatingElement] = useState<RotatingElement | null>(null);
  const [customElements, setCustomElements] = useState<typeof ELEMENTS>([]);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>("#ffffff");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojiSearch, setEmojiSearch] = useState<string>("");
  const [emojiPage, setEmojiPage] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [pencilColor, setPencilColor] = useState<string>("#000000");
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [copiedElement, setCopiedElement] = useState<DroppedElement | null>(null);
  const [showTextModal, setShowTextModal] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>("");
  const [selectedFont, setSelectedFont] = useState<string>("Roboto");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Load custom images from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomElements(parsed);
      } catch (error) {
        console.error('Error loading custom images:', error);
      }
    }
  }, []);

  // Save custom images to localStorage whenever they change
  useEffect(() => {
    if (customElements.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customElements));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [customElements]);

  // Load canvas state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CANVAS_STATE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDroppedElements(parsed.droppedElements || []);
        setCanvasBackgroundColor(parsed.backgroundColor || "#ffffff");
        setDrawingPaths(parsed.drawingPaths || []);
      } catch (error) {
        console.error('Error loading canvas state:', error);
      }
    }
    // Mark initial load as complete after a short delay
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 100);
  }, []);

  // Auto-save with 3 second delay after changes
  useEffect(() => {
    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      return;
    }

    // Clear existing timers
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    setSaveStatus("");
    setCountdown(3);

    // Start countdown interval (updates every second)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set timer for 3 seconds to save
    saveTimerRef.current = setTimeout(() => {
      saveCanvasState();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [droppedElements, canvasBackgroundColor, drawingPaths]);

  const saveCanvasState = () => {
    try {
      const canvasState = {
        droppedElements,
        backgroundColor: canvasBackgroundColor,
        drawingPaths,
      };
      localStorage.setItem(CANVAS_STATE_KEY, JSON.stringify(canvasState));
      setHasUnsavedChanges(false);
      setSaveStatus("Saved");
      
      // Clear the "Saved" message after 2 seconds
      setTimeout(() => {
        setSaveStatus("");
      }, 2000);
    } catch (error) {
      console.error('Error saving canvas state:', error);
      setSaveStatus("Error saving");
    }
  };

  const handleManualSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveCanvasState();
  };

  // Clipboard functionality - Copy & Paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (macOS)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Copy: Ctrl+C or Cmd+C
      if (isCtrlOrCmd && e.key.toLowerCase() === 'c' && selectedElementId) {
        e.preventDefault();
        const elementToCopy = droppedElements.find(el => el.id === selectedElementId);
        if (elementToCopy) {
          setCopiedElement(elementToCopy);
          console.log('Element copied to clipboard');
        }
      }
      
      // Paste: Ctrl+V or Cmd+V
      if (isCtrlOrCmd && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        
        // First check if we have a copied element from canvas
        if (copiedElement && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          
          // Paste with slight offset from original
          const newElement: DroppedElement = {
            ...copiedElement,
            id: `${copiedElement.type}-${Date.now()}-${Math.random()}`,
            x: Math.min(copiedElement.x + 20, rect.width - copiedElement.width),
            y: Math.min(copiedElement.y + 20, rect.height - copiedElement.height),
          };

          setDroppedElements((prev) => [...prev, newElement]);
          setSelectedElementId(newElement.id);
          console.log('Element pasted from clipboard');
        }
      }
    };

    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle external image paste if no copied element exists
      if (copiedElement) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Handle image paste from external sources
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file && canvasRef.current) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageSrc = event.target?.result as string;
              
              // Add image to center of canvas
              const rect = canvasRef.current!.getBoundingClientRect();
              const centerX = rect.width / 2 - 50;
              const centerY = rect.height / 2 - 50;

              const newElement: DroppedElement = {
                id: `clipboard-${Date.now()}-${Math.random()}`,
                type: "clipboard-image",
                x: centerX,
                y: centerY,
                width: 100,
                height: 100,
                src: imageSrc,
                rotation: 0,
                flipHorizontal: false,
                flipVertical: false,
              };

              setDroppedElements((prev) => [...prev, newElement]);
              setSelectedElementId(newElement.id);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, [droppedElements, selectedElementId, copiedElement]);

  // Initialize drawing canvas
  useEffect(() => {
    if (!drawingCanvasRef.current || !canvasRef.current) return;
    
    const canvas = drawingCanvasRef.current;
    const container = canvasRef.current;
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    // Redraw existing paths
    const ctx = canvas.getContext('2d');
    if (ctx && drawingPaths.length > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingPaths.forEach(imageData => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
      });
    }
  }, [drawingPaths]);

  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode || !drawingCanvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(true);
    
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = pencilColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode || !drawingCanvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handleDrawingEnd = () => {
    if (!isDrawing || !drawingCanvasRef.current) return;
    
    const canvas = drawingCanvasRef.current;
    
    // Save the current canvas as image data
    const imageData = canvas.toDataURL();
    setDrawingPaths(prev => [...prev, imageData]);
    
    setIsDrawing(false);
  };

  const handleClearDrawing = () => {
    if (!drawingCanvasRef.current) return;
    
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawingPaths([]);
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, elementId: string) => {
    setDraggedElement(elementId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!draggedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check both default elements and custom elements
    const allElements = [...ELEMENTS, ...customElements];
    const element = allElements.find((el) => el.id === draggedElement);
    if (!element) return;

    const newElement: DroppedElement = {
      id: `${element.id}-${Date.now()}`,
      type: element.id,
      x: x - 32.5, // Center the element on cursor
      y: y - 32.5,
      width: 65,
      height: 65,
      src: element.src,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    };

    setDroppedElements([...droppedElements, newElement]);
    setDraggedElement(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newElement = {
          id: `custom-${Date.now()}-${Math.random()}`,
          name: file.name.split('.')[0],
          src: result,
        };
        setCustomElements((prev) => [...prev, newElement]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleAddPictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartRename = (elementId: string, currentName: string) => {
    setEditingElementId(elementId);
    setEditingName(currentName);
  };

  const handleFinishRename = () => {
    if (editingElementId && editingName.trim()) {
      setCustomElements((prev) =>
        prev.map((el) =>
          el.id === editingElementId
            ? { ...el, name: editingName.trim() }
            : el
        )
      );
    }
    setEditingElementId(null);
    setEditingName("");
  };

  const handleCancelRename = () => {
    setEditingElementId(null);
    setEditingName("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleFinishRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  const handleRemoveFromSidebar = (elementId: string) => {
    setCustomElements((prev) => prev.filter((el) => el.id !== elementId));
    // Also remove any dropped instances of this element from the canvas
    setDroppedElements((prev) => prev.filter((el) => !el.id.startsWith(elementId)));
  };

  const handleEmojiClick = (emoji: string) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 - 50;
    const centerY = rect.height / 2 - 50;

    const newElement: DroppedElement = {
      id: `emoji-${Date.now()}-${Math.random()}`,
      type: "emoji",
      x: centerX,
      y: centerY,
      width: 100,
      height: 100,
      src: emoji,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    };

    setDroppedElements((prev) => [...prev, newElement]);
    setShowEmojiPicker(false);
    setEmojiSearch("");
    setEmojiPage(0);
  };

  // Load Google Fonts dynamically
  useEffect(() => {
    const loadFont = (fontFamily: string) => {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };

    GOOGLE_FONTS.forEach(font => loadFont(font));
  }, []);

  const handleAddText = () => {
    setShowTextModal(true);
    setEditingTextId(null);
    setTextInput("");
    setSelectedFont("Roboto");
  };

  const handleSaveText = () => {
    if (!textInput.trim() || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 - 100;
    const centerY = rect.height / 2 - 25;

    if (editingTextId) {
      // Update existing text
      setDroppedElements((prev) =>
        prev.map((el) =>
          el.id === editingTextId
            ? { ...el, text: textInput, fontFamily: selectedFont }
            : el
        )
      );
    } else {
      // Add new text
      const newElement: DroppedElement = {
        id: `text-${Date.now()}-${Math.random()}`,
        type: "text",
        x: centerX,
        y: centerY,
        width: 200,
        height: 50,
        src: "",
        text: textInput,
        fontFamily: selectedFont,
        fontSize: 24,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
      };

      setDroppedElements((prev) => [...prev, newElement]);
    }

    setShowTextModal(false);
    setTextInput("");
    setEditingTextId(null);
  };

  const handleEditText = (elementId: string) => {
    const element = droppedElements.find((el) => el.id === elementId);
    if (element && element.type === "text") {
      setEditingTextId(elementId);
      setTextInput(element.text || "");
      setSelectedFont(element.fontFamily || "Roboto");
      setShowTextModal(true);
    }
  };

  // Create emoji name mapping for search
  const EMOJI_NAMES: Record<string, string> = {
    "😊": "smile happy face blush",
    "🥰": "love hearts smile happy",
    "😍": "love heart eyes smile",
    "🤗": "hug hugging smile",
    "😘": "kiss love heart",
    "🐱": "cat kitty animal pet",
    "🐶": "dog puppy animal pet",
    "🐭": "mouse animal",
    "🐹": "hamster animal pet",
    "🐰": "rabbit bunny animal",
    "🦊": "fox animal",
    "🐻": "bear animal",
    "🐼": "panda bear animal",
    "🐨": "koala animal",
    "🐯": "tiger face animal",
    "🦁": "lion animal",
    "🐷": "pig animal",
    "🐸": "frog animal",
    "🐵": "monkey animal",
    "🐔": "chicken animal bird",
    "🐧": "penguin animal bird",
    "🐦": "bird animal",
    "🦆": "duck animal bird",
    "🦉": "owl animal bird",
    "🦋": "butterfly animal insect",
    "🐌": "snail animal",
    "🐞": "ladybug animal insect",
    "🐢": "turtle animal",
    "🦕": "dinosaur animal",
    "🦖": "dinosaur t-rex animal",
    "🐙": "octopus animal sea",
    "🐠": "fish animal sea",
    "🐬": "dolphin animal sea",
    "🐳": "whale animal sea",
    "🌸": "flower cherry blossom pink",
    "🌺": "flower hibiscus red",
    "🌻": "sunflower flower yellow",
    "🌷": "tulip flower red pink",
    "🌹": "rose flower red love",
    "💐": "bouquet flowers",
    "🌼": "blossom flower white yellow",
    "🌈": "rainbow colors",
    "⭐": "star",
    "🌟": "star glowing",
    "✨": "sparkles stars",
    "💫": "dizzy star",
    "🔥": "fire hot",
    "❄️": "snowflake cold winter",
    "☀️": "sun sunny",
    "🍎": "apple fruit red",
    "🍊": "orange fruit",
    "🍋": "lemon fruit yellow",
    "🍌": "banana fruit yellow",
    "🍉": "watermelon fruit",
    "🍇": "grapes fruit purple",
    "🍓": "strawberry fruit red",
    "🍒": "cherries fruit red",
    "🍑": "peach fruit",
    "🥝": "kiwi fruit green",
    "🍍": "pineapple fruit",
    "🥥": "coconut fruit",
    "🍅": "tomato vegetable red",
    "🥑": "avocado vegetable green",
    "🍆": "eggplant vegetable purple",
    "🥦": "broccoli vegetable green",
    "🌽": "corn vegetable yellow",
    "🥕": "carrot vegetable orange",
    "🍞": "bread food",
    "🥐": "croissant bread food",
    "🧀": "cheese food",
    "🍕": "pizza food",
    "🍔": "burger hamburger food",
    "🍟": "fries french food",
    "🌭": "hotdog food",
    "🥗": "salad food healthy",
    "🍝": "pasta spaghetti food",
    "🍜": "noodles ramen food",
    "🍱": "bento box food",
    "🍣": "sushi food",
    "🍰": "cake dessert food",
    "🎂": "birthday cake dessert",
    "🧁": "cupcake dessert food",
    "🍭": "lollipop candy sweet",
    "🍬": "candy sweet",
    "🍫": "chocolate candy sweet",
    "🍩": "donut doughnut dessert",
    "🍪": "cookie dessert",
    "🍦": "ice cream dessert",
    "🍨": "ice cream dessert",
    "🍧": "shaved ice dessert",
    "☕": "coffee hot drink",
    "🍵": "tea hot drink",
    "🧋": "bubble tea boba drink",
    "🥤": "drink beverage",
    "🧃": "juice box drink",
    "🥛": "milk drink",
    "🎀": "ribbon bow pink",
    "🎁": "gift present box",
    "🎈": "balloon party",
    "🎉": "party popper celebrate",
    "🎊": "confetti party celebrate",
    "💝": "heart gift love",
    "💖": "sparkling heart love pink",
    "💗": "growing heart love pink",
    "💓": "beating heart love",
    "💞": "revolving hearts love",
    "💕": "two hearts love pink",
    "💟": "heart decoration love",
    "❣️": "heart exclamation love",
    "💔": "broken heart sad",
    "❤️": "red heart love",
    "🧡": "orange heart love",
    "💛": "yellow heart love",
    "💚": "green heart love",
    "💙": "blue heart love",
    "💜": "purple heart love",
    "🤎": "brown heart love",
    "🖤": "black heart love",
    "🤍": "white heart love",
    "♥️": "heart suit love",
  };

  const searchEmojis = (query: string) => {
    if (!query.trim()) return CUTE_EMOJIS;
    
    const lowerQuery = query.toLowerCase();
    return CUTE_EMOJIS.filter((emoji) => {
      const emojiName = EMOJI_NAMES[emoji] || "";
      return emoji.includes(query) || emojiName.includes(lowerQuery);
    });
  };

  const filteredEmojis = searchEmojis(emojiSearch);
  const EMOJIS_PER_PAGE = 60;
  const totalPages = Math.ceil(filteredEmojis.length / EMOJIS_PER_PAGE);
  const currentPageEmojis = filteredEmojis.slice(
    emojiPage * EMOJIS_PER_PAGE,
    (emojiPage + 1) * EMOJIS_PER_PAGE
  );

  const handleEmojiSearchChange = (value: string) => {
    setEmojiSearch(value);
    setEmojiPage(0); // Reset to first page when searching
  };

  const handleResizeStart = (
    e: MouseEvent<HTMLDivElement>,
    elementId: string,
    corner: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const element = droppedElements.find((el) => el.id === elementId);
    if (!element) return;

    setResizing({ elementId, corner });
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    };
  };

  const handleElementMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    elementId: string
  ) => {
    // Don't start dragging if clicking on a resize handle, delete button, rotate button, or flip buttons
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle') || 
        target.classList.contains('delete-btn') || 
        target.classList.contains('rotate-btn') ||
        target.classList.contains('flip-btn')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    const element = droppedElements.find((el) => el.id === elementId);
    if (!element) return;

    // Set this element as selected for copy/paste
    setSelectedElementId(elementId);

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - element.x;
    const offsetY = e.clientY - rect.top - element.y;

    setDraggingElement({ elementId, offsetX, offsetY });
  };

  const handleRotateStart = (
    e: MouseEvent<HTMLButtonElement>,
    elementId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    const element = droppedElements.find((el) => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    const startAngle = angle - element.rotation;

    setRotatingElement({ elementId, startAngle, centerX, centerY });
  };

  const handleDeleteElement = (elementId: string) => {
    setDroppedElements((elements) =>
      elements.filter((el) => el.id !== elementId)
    );
  };

  const handleFlipHorizontal = (elementId: string) => {
    setDroppedElements((elements) =>
      elements.map((el) =>
        el.id === elementId
          ? { ...el, flipHorizontal: !el.flipHorizontal }
          : el
      )
    );
  };

  const handleFlipVertical = (elementId: string) => {
    setDroppedElements((elements) =>
      elements.map((el) =>
        el.id === elementId
          ? { ...el, flipVertical: !el.flipVertical }
          : el
      )
    );
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    // Handle rotation
    if (rotatingElement) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const angle = Math.atan2(
        mouseY - rotatingElement.centerY,
        mouseX - rotatingElement.centerX
      ) * (180 / Math.PI);
      
      const newRotation = angle - rotatingElement.startAngle;

      setDroppedElements((elements) =>
        elements.map((el) =>
          el.id === rotatingElement.elementId
            ? { ...el, rotation: newRotation }
            : el
        )
      );
      return;
    }

    // Handle element dragging
    if (draggingElement && !resizing) {
      const x = e.clientX - rect.left - draggingElement.offsetX;
      const y = e.clientY - rect.top - draggingElement.offsetY;

      setDroppedElements((elements) =>
        elements.map((el) =>
          el.id === draggingElement.elementId
            ? { ...el, x, y }
            : el
        )
      );
      return;
    }

    // Handle resizing
    if (!resizing || !resizeStartRef.current) return;

    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const startWidth = resizeStartRef.current.width;
    const startHeight = resizeStartRef.current.height;

    setDroppedElements((elements) =>
      elements.map((el) => {
        if (el.id !== resizing.elementId) return el;

        let newWidth = el.width;
        let newHeight = el.height;

        // Calculate size based on corner being dragged
        if (resizing.corner.includes("right")) {
          newWidth = startWidth + deltaX;
        } else if (resizing.corner.includes("left")) {
          newWidth = startWidth - deltaX;
        }

        if (resizing.corner.includes("bottom")) {
          newHeight = startHeight + deltaY;
        } else if (resizing.corner.includes("top")) {
          newHeight = startHeight - deltaY;
        }

        // Maintain aspect ratio and apply constraints
        const size = Math.min(newWidth, newHeight);
        const constrainedSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));

        return {
          ...el,
          width: constrainedSize,
          height: constrainedSize,
        };
      })
    );
  };

  const handleMouseUp = () => {
    setResizing(null);
    setDraggingElement(null);
    setRotatingElement(null);
    resizeStartRef.current = null;
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the canvas area
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading canvas:', error);
    }
  };

  return (
    <div className="flex h-screen gap-4 p-4 bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-[family-name:var(--font-be-vietnam-pro)]">
          Come and play!
        </h2>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {ELEMENTS.map((element) => (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => handleDragStart(e, element.id)}
              className="cursor-move bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <img
                  src={element.src}
                  alt={element.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {element.name}
                </span>
              </div>
            </div>
          ))}
          
          {/* Custom uploaded images */}
          {customElements.map((element) => (
            <div
              key={element.id}
              draggable={editingElementId !== element.id}
              onDragStart={(e) => handleDragStart(e, element.id)}
              className="group/item cursor-move bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-200 relative"
            >
              <div className="flex items-center gap-3">
                <img
                  src={element.src}
                  alt={element.name}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
                {editingElementId === element.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleFinishRename}
                    onKeyDown={handleRenameKeyDown}
                    className="text-sm font-medium text-gray-700 border border-blue-500 rounded px-2 py-1 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {element.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(element.id, element.name);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                        title="Rename"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromSidebar(element.id);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity text-red-600"
                        title="Remove from sidebar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* Add more picture button */}
        <button
          onClick={handleAddPictureClick}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Add more picture
        </button>

        {/* Add emoji button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">😊</span>
          Add Emoji
        </button>

        {/* Add text button */}
        <button
          onClick={handleAddText}
          className="mt-2 w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
          Add Text
        </button>

        {/* Text Modal */}
        {showTextModal && (
          <div className="mt-2 bg-white rounded-lg shadow-xl border-2 border-teal-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {editingTextId ? 'Edit Text' : 'Add Text'}
              </h3>
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput("");
                  setEditingTextId(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <textarea
              value={textInput}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setTextInput(value);
                }
              }}
              placeholder="Enter your text..."
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={4}
            />
            
            <div className="text-xs text-gray-500 mb-3 text-right">
              {textInput.length}/500 characters
            </div>
            
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput("");
                  setEditingTextId(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveText}
                disabled={!textInput.trim()}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {editingTextId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <div className="mt-2 bg-white rounded-lg shadow-xl border-2 border-purple-200 p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Choose Emoji</h3>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <input
              type="text"
              value={emojiSearch}
              onChange={(e) => handleEmojiSearchChange(e.target.value)}
              placeholder="Search emoji (e.g., cat, heart, food)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <div className="grid grid-cols-6 gap-2 mb-3">
              {currentPageEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-purple-100 rounded p-2 transition-colors"
                  title={EMOJI_NAMES[emoji] || emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {filteredEmojis.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No emojis found</p>
            )}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setEmojiPage((prev) => Math.max(0, prev - 1))}
                  disabled={emojiPage === 0}
                  className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setEmojiPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={emojiPage >= totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Canvas */}
      <Card className="flex-1 relative overflow-hidden border-2 border-dashed border-gray-300">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          {/* Save status indicator */}
          {(hasUnsavedChanges || saveStatus) && (
            <div className="bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
              {hasUnsavedChanges && !saveStatus && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Saving in {countdown}s...
                </span>
              )}
              {saveStatus === "Saved" && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          )}

          {/* Background Color Picker */}
          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
            <label htmlFor="bg-color" className="text-sm font-medium text-gray-700">
              Background:
            </label>
            <input
              id="bg-color"
              type="color"
              value={canvasBackgroundColor}
              onChange={(e) => setCanvasBackgroundColor(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer border border-gray-300"
            />
          </div>

          {/* Drawing Tools */}
          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
            <button
              onClick={() => setDrawingMode(!drawingMode)}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                drawingMode
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={drawingMode ? 'Disable drawing mode' : 'Enable drawing mode'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
              <span className="text-sm">Draw</span>
            </button>
            
            {drawingMode && (
              <>
                <input
                  type="color"
                  value={pencilColor}
                  onChange={(e) => setPencilColor(e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer border border-gray-300"
                  title="Pencil color"
                />
                <button
                  onClick={handleClearDrawing}
                  className="px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                  title="Clear all drawings"
                >
                  Clear
                </button>
              </>
            )}
          </div>
          
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={droppedElements.length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
        
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={(e) => {
            // Deselect element when clicking on canvas background
            if (e.target === e.currentTarget) {
              setSelectedElementId(null);
            }
          }}
          className="w-full h-full relative"
          style={{ backgroundColor: canvasBackgroundColor }}
        >
          {/* Drawing Canvas */}
          <canvas
            ref={drawingCanvasRef}
            onMouseDown={handleDrawingStart}
            onMouseMove={handleDrawingMove}
            onMouseUp={handleDrawingEnd}
            onMouseLeave={handleDrawingEnd}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            style={{ 
              cursor: drawingMode ? 'crosshair' : 'default',
              pointerEvents: drawingMode ? 'auto' : 'none',
              zIndex: drawingMode ? 10 : 1
            }}
          />

          {droppedElements.length === 0 && !drawingMode && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
              <div className="text-center">
                <p className="text-lg font-medium">Drop elements here</p>
                <p className="text-sm mt-1">
                  Drag items from the sidebar to place them
                </p>
              </div>
            </div>
          )}

          {droppedElements.map((element) => (
            <div
              key={element.id}
              className="absolute group"
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
              }}
            >
              <div
                className={`w-full h-full cursor-move ${
                  selectedElementId === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                style={{
                  transform: `rotate(${element.rotation}deg) scaleX(${element.flipHorizontal ? -1 : 1}) scaleY(${element.flipVertical ? -1 : 1})`,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
              >
                {element.type === "emoji" ? (
                  <div
                    className="w-full h-full flex items-center justify-center pointer-events-none select-none"
                    style={{ fontSize: `${element.width * 0.8}px` }}
                  >
                    {element.src}
                  </div>
                ) : element.type === "text" ? (
                  <div
                    className="w-full h-full flex items-center justify-center pointer-events-none select-none px-2 text-center break-words"
                    style={{ 
                      fontSize: `${element.fontSize || 24}px`,
                      fontFamily: element.fontFamily || 'Roboto',
                      lineHeight: '1.2',
                    }}
                    onDoubleClick={() => handleEditText(element.id)}
                  >
                    {element.text}
                  </div>
                ) : (
                  <img
                    src={element.src}
                    alt={element.type}
                    className="w-full h-full object-cover rounded pointer-events-none"
                    draggable={false}
                  />
                )}

                {/* Resize handles - only visible on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Top-left */}
                  <div
                    className="resize-handle absolute -top-2 -left-2 w-6 h-6 bg-blue-400 rounded-full cursor-nwse-resize shadow-lg border-2 border-white"
                    onMouseDown={(e) =>
                      handleResizeStart(e, element.id, "top-left")
                    }
                  />
                  {/* Top-right */}
                  <div
                    className="resize-handle absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full cursor-nesw-resize shadow-lg border-2 border-white"
                    onMouseDown={(e) =>
                      handleResizeStart(e, element.id, "top-right")
                    }
                  />
                  {/* Bottom-left */}
                  <div
                    className="resize-handle absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full cursor-nesw-resize shadow-lg border-2 border-white"
                    onMouseDown={(e) =>
                      handleResizeStart(e, element.id, "bottom-left")
                    }
                  />
                  {/* Bottom-right */}
                  <div
                    className="resize-handle absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full cursor-nwse-resize shadow-lg border-2 border-white"
                    onMouseDown={(e) =>
                      handleResizeStart(e, element.id, "bottom-right")
                    }
                  />
                </div>
              </div>

              {/* Control buttons centered at bottom - outside transform - only visible on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
                {/* Rotate button - drag to rotate */}
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleRotateStart(e, element.id);
                  }}
                  className="rotate-btn w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 shadow-lg border-2 border-white cursor-grab active:cursor-grabbing pointer-events-auto"
                  title="Drag to rotate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </button>

                {/* Flip Horizontal button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlipHorizontal(element.id);
                  }}
                  className="flip-btn w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 shadow-lg border-2 border-white pointer-events-auto"
                  title="Flip Horizontal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
                    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                    <path d="M12 20v2" />
                    <path d="M12 14v2" />
                    <path d="M12 8v2" />
                    <path d="M12 2v2" />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElement(element.id);
                  }}
                  className="delete-btn w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 shadow-lg border-2 border-white pointer-events-auto"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
