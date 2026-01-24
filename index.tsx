import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import JsBarcode from "jsbarcode";

// --- Icons ---
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2 2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const ZoomInIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>;
const ZoomOutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const CropIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/><path d="M4 4h0"/></svg>;
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>;
const TextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const FilePdfIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M10 18h4"/></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const BarcodeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>;
const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const ResizeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>;

// --- Types ---

interface IdCardData {
  id?: string;
  nameWithInitials: string;
  fullName: string;
  designation: string;
  grade: string;
  nic: string;
  dateOfIssue: string;
  slPostFileNo: string;
}

// Common style properties shared between custom text and standard text fields
interface TextStyle {
    fontFamily?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    script?: 'none' | 'super' | 'sub';
    caps?: 'none' | 'all' | 'small';
    color?: string;
    strokeWidth?: number; // 0 = no outline
    strokeColor?: string;
    opacity?: number; // 0 - 100
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    letterSpacing?: number;
    lineHeight?: number;
}

interface CustomElement extends TextStyle {
    id: string;
    type: 'text' | 'image';
    x: number;
    y: number;
    
    // --- Text Specific ---
    text?: string;
    // (Styles inherited from TextStyle)

    // --- Image Specific ---
    src?: string;
    width?: number; // width in px
    aspectRatio?: number;
}

interface DesignationConfig {
    id: string;
    title: string;
    color: string; // Background color for strips
    textColor: string; // Text color
}

interface GradeConfig {
    id: string;
    title: string;
    textColor: string;
}

interface BarcodeConfig {
    lineColor: string;
    width: number;
    height: number;
    displayValue: boolean;
    textPosition: "top" | "bottom";
    fontSize: number;
}

const FONT_OPTIONS = [
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Brush Script', value: '"Brush Script MT", cursive' },
];

// --- Image Cropper Component ---

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedImage: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onSave }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const VIEWPORT_WIDTH = 240;
  const VIEWPORT_HEIGHT = 280;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (ctx && img) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = VIEWPORT_WIDTH / 2;
        const centerY = VIEWPORT_HEIGHT / 2;
        
        ctx.translate(centerX + offset.x, centerY + offset.y);
        ctx.scale(zoom, zoom);
        
        const aspectImg = img.naturalWidth / img.naturalHeight;
        const aspectViewport = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
        
        let drawWidth, drawHeight;
        
        if (aspectImg > aspectViewport) {
           drawHeight = VIEWPORT_HEIGHT;
           drawWidth = drawHeight * aspectImg;
        } else {
           drawWidth = VIEWPORT_WIDTH;
           drawHeight = drawWidth / aspectImg;
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        
        onSave(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CropIcon /> Adjust Profile Photo
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <CloseIcon />
          </button>
        </div>
        
        <div className="flex-1 bg-gray-900 p-6 flex flex-col items-center justify-center relative select-none">
          <div 
             className="overflow-hidden relative shadow-2xl border-2 border-white/20"
             style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, cursor: isDragging ? 'grabbing' : 'grab' }}
             ref={containerRef}
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
          >
             <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <img 
                  ref={imageRef}
                  src={imageSrc} 
                  alt="Crop Target" 
                  className="max-w-none origin-center"
                  style={{ 
                    height: (imageSrc && (new Image().src = imageSrc) && 0) || '100%', 
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    minWidth: '100%',
                    minHeight: '100%',
                    objectFit: 'cover' 
                  }}
                  draggable={false}
                />
             </div>
             
             <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="w-full h-1/3 border-b border-white"></div>
                <div className="w-full h-1/3 border-b border-white top-1/3 absolute"></div>
                <div className="h-full w-1/3 border-r border-white absolute top-0 left-0"></div>
                <div className="h-full w-1/3 border-r border-white absolute top-0 left-1/3"></div>
             </div>
          </div>
          
          <p className="text-gray-400 text-xs mt-4">Drag to pan • Use slider to zoom</p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
           <div className="flex items-center gap-4 mb-4">
             <span className="text-xs font-medium text-gray-500">Zoom</span>
             <input 
               type="range" 
               min="1" 
               max="3" 
               step="0.05" 
               value={zoom} 
               onChange={(e) => setZoom(parseFloat(e.target.value))} 
               className="flex-1 accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
             />
             <span className="text-xs font-medium text-gray-700 w-8 text-right">{(zoom * 100).toFixed(0)}%</span>
           </div>
           
           <div className="flex gap-3">
             <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
               Cancel
             </button>
             <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 rounded text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2">
               <SaveIcon /> Apply Crop
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Barcode Generator Component ---

const BarcodeGenerator = ({ value, config }: { value: string, config: BarcodeConfig }) => {
    const inputRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            try {
                if (value) {
                    JsBarcode(inputRef.current, value, {
                        format: "CODE128",
                        lineColor: config.lineColor,
                        width: config.width,
                        height: config.height,
                        displayValue: config.displayValue,
                        textPosition: config.textPosition,
                        fontSize: config.fontSize,
                        background: "transparent",
                        margin: 0,
                        textMargin: 2
                    });
                } else {
                     // Clear if empty
                     inputRef.current.innerHTML = "";
                }
            } catch (e) {
                console.error("Barcode generation failed", e);
            }
        }
    }, [value, config]);

    return <svg ref={inputRef} className="w-full h-auto" />;
};

// --- Barcode Manager Modal ---

interface BarcodeManagerProps {
    isOpen: boolean;
    onClose: () => void;
    config: BarcodeConfig;
    setConfig: React.Dispatch<React.SetStateAction<BarcodeConfig>>;
}

const BarcodeManager: React.FC<BarcodeManagerProps> = ({ isOpen, onClose, config, setConfig }) => {
    if (!isOpen) return null;

    const handleUpdate = (field: keyof BarcodeConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <BarcodeIcon /> Manage Barcode
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                     {/* Color */}
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Barcode Color</label>
                        <input 
                            type="color" 
                            value={config.lineColor} 
                            onChange={(e) => handleUpdate('lineColor', e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer border-0 p-0"
                        />
                    </div>

                    {/* Human Readable */}
                    <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-gray-700">Human Readable</label>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={config.displayValue} onChange={(e) => handleUpdate('displayValue', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Text Position */}
                     {config.displayValue && (
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">Text Position</label>
                            <select 
                                value={config.textPosition} 
                                onChange={(e) => handleUpdate('textPosition', e.target.value)}
                                className="border border-gray-300 rounded text-xs px-2 py-1"
                            >
                                <option value="bottom">Below</option>
                                <option value="top">Above</option>
                            </select>
                        </div>
                    )}
                    
                     {/* Font Size */}
                    {config.displayValue && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-700">Text Font Size</label>
                                <span className="text-xs text-gray-500">{config.fontSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="8" 
                                max="24" 
                                step="1"
                                value={config.fontSize} 
                                onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    )}

                    <div className="border-t border-gray-100 my-2 pt-2"></div>

                     {/* Dimensions */}
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">Barcode Height</label>
                             <span className="text-xs text-gray-500">{config.height}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="20" 
                            max="80" 
                            value={config.height} 
                            onChange={(e) => handleUpdate('height', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">Bar Width (Scale)</label>
                             <span className="text-xs text-gray-500">{config.width}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="3" 
                            step="0.1"
                            value={config.width} 
                            onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Designation Manager Modal ---

interface DesignationManagerProps {
    isOpen: boolean;
    onClose: () => void;
    designations: DesignationConfig[];
    setDesignations: React.Dispatch<React.SetStateAction<DesignationConfig[]>>;
}

const DesignationManager: React.FC<DesignationManagerProps> = ({ isOpen, onClose, designations, setDesignations }) => {
    const [newItem, setNewItem] = useState({ title: '', color: '#93c5fd', textColor: '#1e3a8a' });

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newItem.title.trim()) return;
        setDesignations([...designations, { ...newItem, id: Date.now().toString() }]);
        setNewItem({ title: '', color: '#93c5fd', textColor: '#1e3a8a' });
    };

    const handleDelete = (id: string) => {
        setDesignations(designations.filter(d => d.id !== id));
    };

    const handleUpdate = (id: string, field: keyof DesignationConfig, value: string) => {
        setDesignations(designations.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <SettingsIcon /> Manage Designations
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-3 py-2">Strip Color</th>
                                <th className="px-3 py-2">Text Color</th>
                                <th className="px-3 py-2 w-full">Designation Title</th>
                                <th className="px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {designations.map(des => (
                                <tr key={des.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-center">
                                        <input 
                                            type="color" 
                                            value={des.color} 
                                            onChange={(e) => handleUpdate(des.id, 'color', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input 
                                            type="color" 
                                            value={des.textColor} 
                                            onChange={(e) => handleUpdate(des.id, 'textColor', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text" 
                                            value={des.title} 
                                            onChange={(e) => handleUpdate(des.id, 'title', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <button onClick={() => handleDelete(des.id)} className="text-red-400 hover:text-red-600 p-1">
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-blue-50/50">
                                <td className="px-3 py-2 text-center">
                                    <input 
                                        type="color" 
                                        value={newItem.color} 
                                        onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <input 
                                        type="color" 
                                        value={newItem.textColor} 
                                        onChange={(e) => setNewItem({...newItem, textColor: e.target.value})}
                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add new designation..."
                                        value={newItem.title} 
                                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                        className="w-full border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <button onClick={handleAdd} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700">
                                        <PlusIcon />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Grade Manager Modal ---

interface GradeManagerProps {
    isOpen: boolean;
    onClose: () => void;
    grades: GradeConfig[];
    setGrades: React.Dispatch<React.SetStateAction<GradeConfig[]>>;
}

const GradeManager: React.FC<GradeManagerProps> = ({ isOpen, onClose, grades, setGrades }) => {
    const [newItem, setNewItem] = useState({ title: '', textColor: '#1e3a8a' });

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newItem.title.trim()) return;
        setGrades([...grades, { ...newItem, id: Date.now().toString() }]);
        setNewItem({ title: '', textColor: '#1e3a8a' });
    };

    const handleDelete = (id: string) => {
        setGrades(grades.filter(d => d.id !== id));
    };

    const handleUpdate = (id: string, field: keyof GradeConfig, value: string) => {
        setGrades(grades.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <SettingsIcon /> Manage Grades
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-3 py-2 text-center">Text Color</th>
                                <th className="px-3 py-2 w-full">Grade Title</th>
                                <th className="px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {grades.map(grade => (
                                <tr key={grade.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-center">
                                        <input 
                                            type="color" 
                                            value={grade.textColor} 
                                            onChange={(e) => handleUpdate(grade.id, 'textColor', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text" 
                                            value={grade.title} 
                                            onChange={(e) => handleUpdate(grade.id, 'title', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <button onClick={() => handleDelete(grade.id)} className="text-red-400 hover:text-red-600 p-1">
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-blue-50/50">
                                <td className="px-3 py-2 text-center">
                                    <input 
                                        type="color" 
                                        value={newItem.textColor} 
                                        onChange={(e) => setNewItem({...newItem, textColor: e.target.value})}
                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add new grade..."
                                        value={newItem.title} 
                                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                        className="w-full border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <button onClick={handleAdd} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700">
                                        <PlusIcon />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- App Component ---

const App = () => {
  // State
  const [data, setData] = useState<IdCardData>({
    nameWithInitials: "K.A.D. Rangana",
    fullName: "Kasthuri Arachchige Don Rangana",
    designation: "Postal Service Officer",
    grade: "Grade II",
    nic: "861100219V",
    dateOfIssue: "2026-01-24",
    slPostFileNo: "01/2026"
  });

  const [images, setImages] = useState({
    profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    signature: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png",
    frontBg: "https://img.freepik.com/free-vector/abstract-blue-geometric-shapes-background_1035-17545.jpg?w=1380&t=st=1706000000~exp=1706000600~hmac=xyz", 
    backBg: ""
  });
  
  // Designations State
  const [designations, setDesignations] = useState<DesignationConfig[]>([
      { id: '1', title: 'Postal Service Officer', color: '#2563eb', textColor: '#1e3a8a' }, // Strong Blue
      { id: '2', title: 'Deputy Postmaster General', color: '#dc2626', textColor: '#991b1b' }, // Strong Red
      { id: '3', title: 'Postmaster', color: '#16a34a', textColor: '#14532d' }, // Strong Green
      { id: '4', title: 'Assistant', color: '#4b5563', textColor: '#1f2937' }, // Gray
  ]);
  const [isDesignationManagerOpen, setIsDesignationManagerOpen] = useState(false);

  // Grades State
  const [grades, setGrades] = useState<GradeConfig[]>([
    { id: '1', title: 'Grade I', textColor: '#1e3a8a' },
    { id: '2', title: 'Grade II', textColor: '#1e3a8a' },
    { id: '3', title: 'Grade III', textColor: '#1e3a8a' },
  ]);
  const [isGradeManagerOpen, setIsGradeManagerOpen] = useState(false);

  // Barcode State
  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>({
      lineColor: '#1e293b',
      width: 1.8,
      height: 40,
      displayValue: true,
      textPosition: 'bottom',
      fontSize: 12
  });
  const [isBarcodeManagerOpen, setIsBarcodeManagerOpen] = useState(false);
  
  // Generated Cards History (Mocking 3 initial items to match screenshot)
  const [generatedCards, setGeneratedCards] = useState<IdCardData[]>([
    { id: '1', nameWithInitials: 'K.A.D. Rangana', fullName: '', designation: 'Postal Service Officer', grade: 'Grade I', nic: '861100219V', dateOfIssue: '2026-01-23', slPostFileNo: '01/2026' },
    { id: '2', nameWithInitials: 'K.A.D. Rangana', fullName: '', designation: 'Deputy Postmaster General', grade: 'Grade II', nic: '861100219V', dateOfIssue: '2026-01-19', slPostFileNo: '01/2026' },
    { id: '3', nameWithInitials: 'K.A.D. Rangana', fullName: '', designation: 'Postal Service Officer', grade: 'Grade II', nic: '861100219V', dateOfIssue: '2026-01-24', slPostFileNo: '01/2026' },
  ]);

  const [zoom, setZoom] = useState(100);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Custom Elements State
  const [activeTab, setActiveTab] = useState<'frontImages'|'frontText'|'backImages'|'backText'>('frontText');
  const [customElements, setCustomElements] = useState<CustomElement[]>([
      { 
          id: '1', 
          type: 'text', 
          text: 'Department of Post', 
          bold: false, 
          italic: false, 
          fontSize: 10, 
          color: '#000000', 
          x: 20, 
          y: 50,
          fontFamily: '"Inter", sans-serif',
          opacity: 100,
          textAlign: 'left'
      }
  ]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Initial styles for standard fields
  const [standardStyles, setStandardStyles] = useState<Record<string, TextStyle>>({
      nameWithInitials: { fontSize: 16, bold: true, color: '#111827', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      fullName: { fontSize: 10, color: '#4b5563', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      designation: { fontSize: 12, bold: true, color: '#1e3a8a', fontFamily: '"Inter", sans-serif', textAlign: 'center', caps: 'all' },
      grade: { fontSize: 10, color: '#1e3a8a', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      footerLeft: { fontSize: 9, color: '#4b5563', fontFamily: '"Inter", sans-serif', bold: true },
      footerRight: { fontSize: 9, color: '#4b5563', fontFamily: '"Inter", sans-serif', bold: true }
  });
  
  // Dragging State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, elX: 0, elY: 0, elW: 0, startW: 0 });

  // Crop State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [tempCropImage, setTempCropImage] = useState<string | null>(null);
  
  // Computed property for current designation config
  const activeDesignation = designations.find(d => d.title === data.designation);
  // Computed property for current grade config
  const activeGrade = grades.find(g => g.title === data.grade);
  
  // Helper to get selected style/element data
  const isStandardSelection = selectedElementId && selectedElementId.startsWith('std_');
  const selectedStandardKey = isStandardSelection ? selectedElementId!.replace('std_', '') : null;
  
  const selectedStyle: TextStyle | undefined = isStandardSelection
      ? standardStyles[selectedStandardKey!]
      : customElements.find(el => el.id === selectedElementId);

  // Focus effect for editing
  useEffect(() => {
        if (editingElementId) {
            const el = document.getElementById(`editable-text-${editingElementId}`);
            if (el) {
                el.focus();
            }
        }
  }, [editingElementId]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (key: keyof typeof images) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (key === 'profile') {
           setTempCropImage(result);
           setIsCropperOpen(true);
        } else {
           setImages(prev => ({ ...prev, [key]: result }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleOpenCropper = () => {
      if (images.profile) {
          setTempCropImage(images.profile);
          setIsCropperOpen(true);
      }
  };

  const handleCropSave = (croppedImage: string) => {
      setImages(prev => ({ ...prev, profile: croppedImage }));
      setIsCropperOpen(false);
      setTempCropImage(null);
  };
  
  const handleCropCancel = () => {
      setIsCropperOpen(false);
      setTempCropImage(null);
  };

  const handleGenerateCard = () => {
      const newCard = { ...data, id: Date.now().toString() };
      setGeneratedCards(prev => [newCard, ...prev]);
  };
  
  const handleDeleteCard = (id: string) => {
      setGeneratedCards(prev => prev.filter(c => c.id !== id));
  };
  
  // Custom Elements Handlers
  const addCustomText = () => {
      const newEl: CustomElement = { 
          id: Date.now().toString(), 
          type: 'text',
          text: 'New Text', 
          bold: false, 
          italic: false, 
          fontSize: 12, 
          color: '#000000',
          x: 20,
          y: 20,
          fontFamily: '"Inter", sans-serif',
          opacity: 100,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0
      };
      setCustomElements([...customElements, newEl]);
      setSelectedElementId(newEl.id);
  };

  const addCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            // Get image dimensions to maintain aspect ratio
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const newEl: CustomElement = {
                    id: Date.now().toString(),
                    type: 'image',
                    src: result,
                    width: 100, // Default width
                    aspectRatio: aspectRatio,
                    x: 20,
                    y: 20,
                    opacity: 100
                };
                setCustomElements(prev => [...prev, newEl]);
                setSelectedElementId(newEl.id);
            };
            img.src = result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const updateSelectedStyle = (updates: Partial<TextStyle>) => {
      if (isStandardSelection) {
          setStandardStyles(prev => ({
              ...prev,
              [selectedStandardKey!]: { ...prev[selectedStandardKey!], ...updates }
          }));
      } else {
          setCustomElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, ...updates } : el));
      }
  };
  
  const updateCustomElementText = (text: string) => {
      setCustomElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, text } : el));
  };
  
  const updateCustomElement = (id: string, updates: Partial<CustomElement>) => {
      setCustomElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteCustomElement = (id: string) => {
      setCustomElements(prev => prev.filter(el => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
  };

  // Drag and Drop Logic
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering preview dragging if implemented
    
    // Prevent dragging if this element is currently being edited
    if (editingElementId === id) return;

    const el = customElements.find(c => c.id === id);
    if(!el) return;

    setDraggingId(id);
    setSelectedElementId(id);
    dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elX: el.x,
        elY: el.y,
        elW: 0, 
        startW: 0
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const el = customElements.find(c => c.id === id);
    if (!el) return;
    
    setResizingId(id);
    dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elX: 0,
        elY: 0,
        elW: 0,
        startW: el.width || 100
    };
  };

  // Global mouse handlers for drag/resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (draggingId) {
             const scale = zoom / 100;
             const dx = (e.clientX - dragStartRef.current.x) / scale;
             const dy = (e.clientY - dragStartRef.current.y) / scale;
             
             setCustomElements(prev => prev.map(el => {
                 if (el.id === draggingId) {
                     return { ...el, x: dragStartRef.current.elX + dx, y: dragStartRef.current.elY + dy };
                 }
                 return el;
             }));
        } else if (resizingId) {
             const scale = zoom / 100;
             const dx = (e.clientX - dragStartRef.current.x) / scale;
             // Resize logic (width only, height calculated by aspect ratio)
             setCustomElements(prev => prev.map(el => {
                 if (el.id === resizingId) {
                     const newWidth = Math.max(20, dragStartRef.current.startW + dx);
                     return { ...el, width: newWidth };
                 }
                 return el;
             }));
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setResizingId(null);
    };

    if (draggingId || resizingId) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, zoom]);


  // AI Functionality
  const autoFillData = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a fictitious Sri Lankan identity profile for a postal department employee. Return ONLY JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nameWithInitials: { type: Type.STRING },
              fullName: { type: Type.STRING },
              designation: { type: Type.STRING },
              grade: { type: Type.STRING },
              nic: { type: Type.STRING },
              dateOfIssue: { type: Type.STRING },
              slPostFileNo: { type: Type.STRING }
            }
          }
        }
      });
      
      const generated = JSON.parse(response.text);
      setData(generated);
    } catch (e) {
      console.error("AI Error", e);
      alert("Failed to auto-fill data. Please check console.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Helper render to avoid duplicates in sidebar inspector
  const renderTextInspector = () => {
      if (!selectedStyle) return null;
      
      return (
        <div className="bg-gray-50 rounded border border-gray-200 p-3 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-700">
                    {isStandardSelection ? `Edit ${selectedStandardKey}` : 'Edit Text'}
                </span>
                <button onClick={() => setSelectedElementId(null)} className="text-xs text-blue-600 hover:underline">Close</button>
            </div>

            {/* Text Content - only editable for Custom Elements here. Standard fields edited in main form */}
            {!isStandardSelection && (
                <textarea
                    value={(selectedStyle as CustomElement).text}
                    onChange={(e) => updateCustomElementText(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none min-h-[60px]"
                    placeholder="Type text here..."
                />
            )}

            {/* Font Family & Size */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Font</label>
                    <select 
                        value={selectedStyle.fontFamily}
                        onChange={(e) => updateSelectedStyle({ fontFamily: e.target.value })}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                    >
                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Size (px)</label>
                    <input 
                        type="number" 
                        value={selectedStyle.fontSize}
                        onChange={(e) => updateSelectedStyle({ fontSize: parseInt(e.target.value) })}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                    />
                </div>
            </div>

            {/* Style Toggles */}
            <div className="flex justify-between bg-white border border-gray-200 rounded p-1">
                <button 
                    onClick={() => updateSelectedStyle({ bold: !selectedStyle.bold })}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedStyle.bold ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Bold"
                ><span className="font-bold text-xs">B</span></button>
                <button 
                    onClick={() => updateSelectedStyle({ italic: !selectedStyle.italic })}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedStyle.italic ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Italic"
                ><span className="italic text-xs font-serif">I</span></button>
                <button 
                    onClick={() => updateSelectedStyle({ underline: !selectedStyle.underline })}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedStyle.underline ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Underline"
                ><span className="underline text-xs">U</span></button>
                <button 
                    onClick={() => updateSelectedStyle({ strikethrough: !selectedStyle.strikethrough })}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedStyle.strikethrough ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Strikethrough"
                ><span className="line-through text-xs">S</span></button>
                <div className="w-px bg-gray-200 mx-1"></div>
                <button 
                    onClick={() => updateSelectedStyle({ script: selectedStyle.script === 'super' ? 'none' : 'super' })}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedStyle.script === 'super' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Superscript"
                ><span className="text-[10px]">X<sup>2</sup></span></button>
                <button 
                    onClick={() => updateSelectedStyle({ script: selectedStyle.script === 'sub' ? 'none' : 'sub' })}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedStyle.script === 'sub' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Subscript"
                ><span className="text-[10px]">X<sub>2</sub></span></button>
            </div>

            {/* Caps */}
            <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Caps:</span>
                    <div className="flex gap-1">
                    {['none', 'all', 'small'].map((c) => (
                        <button 
                            key={c}
                            onClick={() => updateSelectedStyle({ caps: c as any })}
                            className={`px-2 py-0.5 rounded text-[10px] border ${selectedStyle.caps === c ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                            {c === 'none' ? 'Aa' : c === 'all' ? 'AA' : 'Aa'}
                        </button>
                    ))}
                    </div>
            </div>

            {/* Alignment */}
            <div className="flex justify-between bg-white border border-gray-200 rounded p-1">
                {['left', 'center', 'right', 'justify'].map((align) => (
                        <button 
                        key={align}
                        onClick={() => updateSelectedStyle({ textAlign: align as any })}
                        className={`p-1.5 rounded hover:bg-gray-100 flex-1 flex justify-center ${selectedStyle.textAlign === align ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        title={align}
                    >
                        <span className="text-[10px] capitalize">{align[0].toUpperCase()}</span>
                    </button>
                ))}
            </div>

            {/* Color & Stroke */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-gray-500">Text Color</label>
                    <input type="color" className="w-8 h-8 p-0 rounded cursor-pointer border border-gray-300" value={selectedStyle.color} onChange={(e) => updateSelectedStyle({ color: e.target.value })} />
                </div>
                
                <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-gray-500">Opacity: {selectedStyle.opacity}%</label>
                    <input type="range" min="0" max="100" value={selectedStyle.opacity ?? 100} onChange={(e) => updateSelectedStyle({ opacity: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] text-gray-500">Text Outline</label>
                        <input type="range" min="0" max="5" step="0.5" value={selectedStyle.strokeWidth || 0} onChange={(e) => updateSelectedStyle({ strokeWidth: parseFloat(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    {selectedStyle.strokeWidth && selectedStyle.strokeWidth > 0 ? (
                        <div className="flex justify-between items-center mt-1">
                            <label className="block text-[10px] text-gray-500">Outline Color</label>
                            <input type="color" className="w-8 h-6 p-0 rounded cursor-pointer border border-gray-300" value={selectedStyle.strokeColor || '#000000'} onChange={(e) => updateSelectedStyle({ strokeColor: e.target.value })} />
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Spacing */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Letter Spacing (px)</label>
                    <input 
                        type="number" 
                        step="0.1"
                        value={selectedStyle.letterSpacing || 0}
                        onChange={(e) => updateSelectedStyle({ letterSpacing: parseFloat(e.target.value) })}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Line Height</label>
                    <input 
                        type="number" 
                        step="0.1"
                        value={selectedStyle.lineHeight || 1.2}
                        onChange={(e) => updateSelectedStyle({ lineHeight: parseFloat(e.target.value) })}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                    />
                </div>
            </div>
            
            {!isStandardSelection && (
                <button 
                    onClick={() => deleteCustomElement((selectedStyle as CustomElement).id)}
                    className="w-full py-2 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 flex items-center justify-center gap-2"
                >
                    <TrashIcon /> Delete Element
                </button>
            )}
        </div>
      );
  };

  // Helper style generator
  const getComputedTextStyle = (style: TextStyle): React.CSSProperties => ({
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: [style.underline ? 'underline' : '', style.strikethrough ? 'line-through' : ''].filter(Boolean).join(' '),
    verticalAlign: style.script === 'super' ? 'super' : style.script === 'sub' ? 'sub' : 'baseline',
    textTransform: style.caps === 'all' ? 'uppercase' : 'none',
    fontVariant: style.caps === 'small' ? 'small-caps' : 'normal',
    lineHeight: style.lineHeight || 1.2,
    letterSpacing: `${style.letterSpacing || 0}px`,
    textAlign: style.textAlign || 'left',
    whiteSpace: 'pre-wrap',
    opacity: (style.opacity ?? 100) / 100,
    color: style.color,
    WebkitTextStroke: style.strokeWidth ? `${style.strokeWidth}px ${style.strokeColor || '#000'}` : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      
      {/* Modals */}
      {isCropperOpen && tempCropImage && (
          <ImageCropper 
            imageSrc={tempCropImage} 
            onCancel={handleCropCancel} 
            onSave={handleCropSave} 
          />
      )}
      
      <DesignationManager 
        isOpen={isDesignationManagerOpen}
        onClose={() => setIsDesignationManagerOpen(false)}
        designations={designations}
        setDesignations={setDesignations}
      />
      
      <GradeManager 
        isOpen={isGradeManagerOpen}
        onClose={() => setIsGradeManagerOpen(false)}
        grades={grades}
        setGrades={setGrades}
      />

      <BarcodeManager 
        isOpen={isBarcodeManagerOpen}
        onClose={() => setIsBarcodeManagerOpen(false)}
        config={barcodeConfig}
        setConfig={setBarcodeConfig}
      />

      {/* Header */}
      <header className="bg-[#1e88e5] text-white p-4 shadow-md flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold leading-tight">ID Card Management System</h1>
                <p className="text-xs text-blue-100 opacity-90">Department of Posts - Sri Lanka | Magicard 300 NEO</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-50 transition-colors">Publish</button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center sticky top-[72px] z-10 shadow-sm">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <SearchIcon /> Search by NIC
        </button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <UploadIcon /> Import Excel
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <DownloadIcon /> Export to Excel
        </button>
        <div className="flex-1"></div>
        <button 
            onClick={autoFillData}
            disabled={loadingAi}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors"
        >
            {loadingAi ? <div className="animate-spin h-3 w-3 border-2 border-purple-700 rounded-full border-t-transparent"></div> : <SparklesIcon />}
            AI Auto-Fill
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <SaveIcon /> Save Template
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <UploadIcon /> Load Template
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto content-start">
        
        {/* Left Column - Forms */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
            
            {/* Background Images Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Background Images</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Front Side Background</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-24 bg-gray-100 rounded border border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                                {images.frontBg ? <img src={images.frontBg} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Preview</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                                    <UploadIcon /> Upload
                                    <input type="file" className="hidden" onChange={handleImageUpload('frontBg')} />
                                </label>
                                <button className="text-xs text-red-500 hover:text-red-600 text-left px-1">Remove</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Back Side Background</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-24 bg-gray-100 rounded border border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                                {images.backBg ? <img src={images.backBg} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Preview</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                                    <UploadIcon /> Upload
                                    <input type="file" className="hidden" onChange={handleImageUpload('backBg')} />
                                </label>
                                <button className="text-xs text-red-500 hover:text-red-600 text-left px-1">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4">Upload JPG images (54mm x 85.6mm recommended) to use as card backgrounds.</p>
            </div>

            {/* ID Card Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base font-bold text-gray-800">ID Card Details</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsDesignationManagerOpen(true)}
                            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <SettingsIcon /> Manage Designations
                        </button>
                         <button 
                            onClick={() => setIsGradeManagerOpen(true)}
                            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <SettingsIcon /> Manage Grades
                        </button>
                        <button 
                            onClick={() => setIsBarcodeManagerOpen(true)}
                            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <BarcodeIcon /> Manage Barcode
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Photo */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex gap-6 items-center">
                            <div className="w-24 h-28 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative group">
                                {images.profile ? <img src={images.profile} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleOpenCropper}>
                                   <CropIcon className="text-white" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="px-4 py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2 bg-white">
                                    <UploadIcon /> Browse & Upload
                                    <input type="file" className="hidden" onChange={handleImageUpload('profile')} />
                                </label>
                                <button 
                                  onClick={handleOpenCropper}
                                  className="px-4 py-2 border-0 text-xs font-medium hover:text-blue-600 flex items-center gap-2 text-gray-600"
                                >
                                    <CropIcon /> Adjust Photo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name with Initials</label>
                            <input type="text" name="nameWithInitials" value={data.nameWithInitials} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="fullName" value={data.fullName} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                            <select name="designation" value={data.designation} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                                {designations.map(d => (
                                    <option key={d.id} value={d.title}>{d.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                            <select name="grade" value={data.grade} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                                {grades.map(g => (
                                    <option key={g.id} value={g.title}>{g.title}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Modified Row for NIC and Date */}
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">NIC Number <span className="text-gray-400 font-normal text-[10px]">(generates barcode)</span></label>
                                <input type="text" name="nic" value={data.nic} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Issue</label>
                                <input type="date" name="dateOfIssue" value={data.dateOfIssue} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">SL Post File No</label>
                            <input type="text" name="slPostFileNo" value={data.slPostFileNo} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                        </div>
                    </div>

                    {/* Signature */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Signature (for back side)</label>
                        <div className="flex gap-4 items-center">
                             <div className="w-24 h-12 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden">
                                {images.signature ? <img src={images.signature} className="max-w-full max-h-full" /> : <span className="text-xs text-gray-400">No Sig</span>}
                             </div>
                             <label className="px-4 py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                                <UploadIcon /> Browse & Upload
                                <input type="file" className="hidden" onChange={handleImageUpload('signature')} />
                            </label>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <button 
                            onClick={handleGenerateCard}
                            className="bg-[#1e88e5] hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium shadow-sm transition-colors"
                        >
                            Generate ID Card
                        </button>
                    </div>

                </div>
            </div>

            {/* Custom Elements Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Custom Elements</h2>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    {['Front Images', 'Front Text', 'Back Images', 'Back Text'].map((tab) => {
                         // Simple camelCase conversion for state check
                         const key = tab.replace(/\s+/g, '').replace(/^(.)/, (c) => c.toLowerCase()) as typeof activeTab;
                         return (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(key)}
                                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'frontText' ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-medium text-gray-600">Front Side - Custom Elements</span>
                            <div className="flex gap-2">
                                <button onClick={addCustomText} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors">
                                    <PlusIcon /> Add Text
                                </button>
                                <label className="text-xs flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors cursor-pointer">
                                    <ImageIcon /> Add Image
                                    <input type="file" className="hidden" accept="image/*" onChange={addCustomImage} />
                                </label>
                            </div>
                        </div>

                        {/* Use shared inspector if something is selected */}
                        {selectedStyle ? renderTextInspector() : (
                            // LIST VIEW
                            <div className="space-y-3">
                                {customElements.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className={`flex items-center gap-2 p-2 rounded border transition-colors cursor-pointer ${selectedElementId === item.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                                        onClick={() => setSelectedElementId(item.id)}
                                    >
                                        <div className="w-6 flex items-center justify-center text-gray-400">
                                            {item.type === 'text' ? <TextIcon /> : <ImageIcon />}
                                        </div>
                                        
                                        {item.type === 'text' ? (
                                            <div className="flex-1 overflow-hidden">
                                                <div className="text-xs font-medium truncate text-gray-700">{item.text || "Empty Text"}</div>
                                                <div className="text-[10px] text-gray-400 truncate">
                                                    {item.fontSize}px • {item.fontFamily?.split(',')[0].replace(/"/g, '')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 text-xs text-gray-500 italic flex items-center justify-between">
                                                <span>Image Object</span>
                                                <span className="text-[10px] bg-gray-200 px-1 rounded">{(item.width || 0).toFixed(0)}px width</span>
                                            </div>
                                        )}

                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteCustomElement(item.id); }}
                                            className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                                {customElements.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-4">No custom elements added yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-20 flex items-center justify-center text-gray-400 text-xs italic">
                        Not implemented for this demo
                    </div>
                )}
            </div>
        </div>

        {/* Right Column - Preview */}
        <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-gray-800">Card Preview</h2>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" onClick={() => setZoom(z => Math.max(z - 10, 50))}><ZoomOutIcon /></button>
                        <span className="text-xs font-medium text-gray-600 w-10 text-center">{zoom}%</span>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" onClick={() => setZoom(z => Math.min(z + 10, 200))}><ZoomInIcon /></button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button className="bg-[#1e88e5] text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm">Drag Mode</button>
                        <button className="text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-100 rounded font-medium">Reset Positions</button>
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 mb-6 border border-blue-100 text-[11px] text-gray-600 leading-relaxed">
                    Drag elements on the card to reposition them. Select images to resize using the handle. Click elements to edit properties.
                </div>

                <div className="flex flex-col items-center gap-8 overflow-hidden bg-gray-50 p-8 rounded-xl inner-shadow border border-gray-100" style={{ minHeight: '600px'}}>
                    
                    {/* Front Side */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">Front Side</span>
                        <div className="relative group shadow-2xl transition-transform duration-200 bg-white" style={{ width: '320px', height: '500px', transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
                            {/* Background */}
                            <div className="absolute inset-0 bg-white rounded-xl overflow-hidden border border-gray-200 pointer-events-none">
                                {images.frontBg && <img src={images.frontBg} className="w-full h-full object-cover" />}
                                {/* Overlay Gradient simulating card sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                            </div>
                            
                            {/* DYNAMIC STRIPS - DESIGNATION COLOR */}
                            {/* Top Strip */}
                            <div 
                                className="absolute left-0 right-0 h-4 z-10 pointer-events-none" 
                                style={{ top: '45px', backgroundColor: activeDesignation?.color || '#2563eb' }} 
                            ></div>
                            
                            {/* Bottom Strip */}
                            <div 
                                className="absolute left-0 right-0 bottom-0 h-5 z-10 pointer-events-none" 
                                style={{ backgroundColor: activeDesignation?.color || '#2563eb' }} 
                            ></div>

                            {/* Content Layer */}
                            <div className="absolute inset-0 flex flex-col items-center pt-5 text-center p-4 z-20">
                                {/* Logo Area */}
                                <div className="flex items-center justify-between w-full px-2 mb-6 pointer-events-none">
                                     <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white">Logo</div>
                                     <div className="flex flex-col">
                                        <span className="text-[12px] font-bold text-gray-800 uppercase tracking-wide leading-none">Department of Posts</span>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight">Sri Lanka</span>
                                     </div>
                                     <div className="w-8"></div> {/* Spacer for center alignment */}
                                </div>
                                
                                {/* Photo */}
                                <div className="w-28 h-32 bg-gray-200 border-4 border-white shadow-md mb-3 overflow-hidden rounded-sm mt-2 pointer-events-none">
                                    {images.profile && <img src={images.profile} className="w-full h-full object-cover" />}
                                </div>

                                {/* Text Details - Clickable Standard Fields */}
                                <div 
                                    className={`mb-0.5 cursor-pointer hover:ring-1 hover:ring-blue-300 rounded px-1 ${selectedElementId === 'std_nameWithInitials' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setSelectedElementId('std_nameWithInitials'); }}
                                    style={getComputedTextStyle(standardStyles.nameWithInitials)}
                                >
                                    {data.nameWithInitials || "Name"}
                                </div>
                                
                                <div 
                                    className={`mb-3 px-4 cursor-pointer hover:ring-1 hover:ring-blue-300 rounded ${selectedElementId === 'std_fullName' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setSelectedElementId('std_fullName'); }}
                                    style={getComputedTextStyle(standardStyles.fullName)}
                                >
                                    {data.fullName || "Full Name"}
                                </div>
                                
                                <div className="mb-2 w-full flex flex-col items-center">
                                    <div 
                                        className={`cursor-pointer hover:ring-1 hover:ring-blue-300 rounded px-2 ${selectedElementId === 'std_designation' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId('std_designation'); }}
                                        style={getComputedTextStyle({ ...standardStyles.designation, color: standardStyles.designation.color !== '#1e3a8a' ? standardStyles.designation.color : (activeDesignation?.textColor || '#1e3a8a') })}
                                    >
                                        {data.designation || "Designation"}
                                    </div>
                                    <div 
                                        className={`cursor-pointer hover:ring-1 hover:ring-blue-300 rounded px-2 ${selectedElementId === 'std_grade' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId('std_grade'); }}
                                        style={getComputedTextStyle({ ...standardStyles.grade, color: standardStyles.grade.color !== '#1e3a8a' ? standardStyles.grade.color : (activeGrade?.textColor || '#1e3a8a') })}
                                    >
                                        {data.grade}
                                    </div>
                                </div>

                                {/* Barcode Implementation */}
                                <div className="mt-auto mb-5 w-full px-4 flex flex-col items-center pointer-events-none">
                                    {/* Wrapper div with explicit width control for SVG scaling */}
                                    <div className="w-full max-w-[90%] overflow-hidden flex justify-center">
                                        <BarcodeGenerator value={data.nic} config={barcodeConfig} />
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-1 w-full pointer-events-auto">
                                        <div
                                            className={`cursor-pointer hover:ring-1 hover:ring-blue-300 rounded px-1 ${selectedElementId === 'std_footerLeft' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedElementId('std_footerLeft'); }}
                                            style={getComputedTextStyle(standardStyles.footerLeft)}
                                        >
                                            Date: {data.dateOfIssue}
                                        </div>
                                        <div
                                            className={`cursor-pointer hover:ring-1 hover:ring-blue-300 rounded px-1 ${selectedElementId === 'std_footerRight' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedElementId('std_footerRight'); }}
                                            style={getComputedTextStyle(standardStyles.footerRight)}
                                        >
                                            SL Post {data.slPostFileNo}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Custom Elements Rendering */}
                                {customElements.map(el => {
                                    const textStyle = el.type === 'text' ? getComputedTextStyle(el) : {};
                                    const isEditing = editingElementId === el.id;

                                    return (
                                        <div 
                                            key={el.id} 
                                            onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                if (el.type === 'text') setEditingElementId(el.id);
                                            }}
                                            className={`absolute cursor-move group select-none pointer-events-auto ${selectedElementId === el.id ? 'ring-1 ring-blue-500 ring-dashed z-50' : 'hover:ring-1 hover:ring-gray-300 hover:ring-dashed z-40'}`}
                                            style={{ 
                                                top: `${el.y}px`, 
                                                left: `${el.x}px`, 
                                            }}
                                        >
                                            {el.type === 'text' ? (
                                                <div 
                                                    id={`editable-text-${el.id}`}
                                                    contentEditable={isEditing}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => {
                                                        updateCustomElement(el.id, { text: e.currentTarget.innerText });
                                                        setEditingElementId(null);
                                                    }}
                                                    onMouseDown={(e) => {
                                                        // If editing, prevent the parent from starting a drag
                                                        if (isEditing) e.stopPropagation();
                                                    }}
                                                    style={{
                                                        ...textStyle,
                                                        cursor: isEditing ? 'text' : 'move',
                                                        outline: isEditing ? 'none' : undefined,
                                                        minWidth: isEditing ? '20px' : undefined
                                                    }}
                                                >
                                                    {el.text}
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: `${el.width}px`,
                                                    height: 'auto',
                                                    opacity: (el.opacity ?? 100) / 100
                                                }} className="relative">
                                                    <img src={el.src} className="w-full h-auto pointer-events-none" />
                                                    
                                                    {/* Resize Handle */}
                                                    {selectedElementId === el.id && (
                                                        <div 
                                                            onMouseDown={(e) => handleResizeMouseDown(e, el.id)}
                                                            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border border-blue-500 rounded-full shadow cursor-se-resize flex items-center justify-center z-50 hover:bg-blue-50"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div className="flex flex-col items-center gap-2">
                         <span className="text-xs font-semibold text-gray-500">Back Side</span>
                        <div className="relative group shadow-2xl transition-transform duration-200 bg-white" style={{ width: '320px', height: '500px', transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
                            <div className="absolute inset-0 bg-white rounded-xl overflow-hidden border border-gray-200">
                                {images.backBg && <img src={images.backBg} className="w-full h-full object-cover" />}
                            </div>
                            
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                                {/* Back Barcode */}
                                <div className="w-full mb-8 px-4 opacity-90">
                                    <BarcodeGenerator value={data.nic} config={{ ...barcodeConfig, displayValue: false }} />
                                </div>

                                <div className="border-b border-dashed border-gray-400 w-3/4 mb-2 pb-2 min-h-[40px] flex items-end justify-center">
                                    {images.signature && <img src={images.signature} className="h-12 mx-auto opacity-80" />}
                                </div>
                                <p className="text-[10px] font-bold text-gray-800 mb-12 uppercase tracking-wide">Signature of Card Holder</p>

                                <div className="mt-auto space-y-3 w-full">
                                    <div className="w-full flex justify-center">
                                        <div className="w-32 h-12 relative">
                                             {/* Simulated Signature */}
                                            <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full text-blue-900 opacity-70">
                                                 <path d="M20,50 Q50,20 80,50 T150,50" fill="none" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-900">Postmaster General</p>
                                    
                                    <div className="text-[9px] text-gray-500 leading-relaxed mt-6 border-t border-gray-100 pt-2 w-full">
                                        If found, Please return to:<br/>
                                        <span className="font-semibold text-gray-700">Postmaster General</span><br/>
                                        Colombo - 01000
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                
                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 bg-[#1e88e5] text-white px-6 py-2 rounded font-medium shadow-md hover:bg-blue-600 transition-colors">
                        <FilePdfIcon /> Save as PDF
                    </button>
                </div>
            </div>
        </div>

      </div>

      {/* Generated Cards Table Section */}
      <div className="bg-white border-t border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Generated Cards ({generatedCards.length})</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Designation</th>
                          <th className="px-6 py-3">Grade</th>
                          <th className="px-6 py-3">NIC</th>
                          <th className="px-6 py-3">Date of Issue</th>
                          <th className="px-6 py-3">File No</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {generatedCards.map((card) => (
                          <tr key={card.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-medium text-gray-900">{card.nameWithInitials}</td>
                              <td className="px-6 py-4 text-gray-600">{card.designation}</td>
                              <td className="px-6 py-4 text-gray-600">{card.grade}</td>
                              <td className="px-6 py-4 text-gray-600 font-mono text-xs">{card.nic}</td>
                              <td className="px-6 py-4 text-gray-600">{card.dateOfIssue}</td>
                              <td className="px-6 py-4 text-gray-600">{card.slPostFileNo}</td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                      <button className="text-gray-400 hover:text-blue-600"><EyeIcon /></button>
                                      <button className="text-gray-400 hover:text-green-600"><PrinterIcon /></button>
                                      <button onClick={() => handleDeleteCard(card.id!)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {generatedCards.length === 0 && (
                          <tr>
                              <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">No generated cards yet. Use the form above to create one.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);