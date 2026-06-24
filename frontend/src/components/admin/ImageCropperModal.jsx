import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Check, X, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

export function ImageCropperModal({ isOpen, imageSrc, fileName, onCrop, onClose }) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    // Reset state when opening modal / changing image
    useEffect(() => {
        if (isOpen && imageSrc) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setImageLoaded(false);
        }
    }, [isOpen, imageSrc]);

    // Handle window resize or container layout updates
    useEffect(() => {
        if (isOpen && imageLoaded) {
            updateDimensions();
        }
    }, [isOpen, imageLoaded]);

    const updateDimensions = () => {
        if (!containerRef.current || !imageRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const cW = containerRect.width;
        const cH = containerRect.height;
        setContainerSize({ width: cW, height: cH });

        const img = imageRef.current;
        const iW = img.naturalWidth;
        const iH = img.naturalHeight;
        setNaturalSize({ width: iW, height: iH });

        // Calculate base size to completely cover the 3:2 container (object-cover logic)
        const scale = Math.max(cW / iW, cH / iH);
        const bW = iW * scale;
        const bH = iH * scale;
        setBaseSize({ width: bW, height: bH });

        // Center the image initially
        setPosition({
            x: (cW - bW) / 2,
            y: (cH - bH) / 2
        });
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    // Constrain position helper
    const getConstrainedPosition = (x, y, currentZoom) => {
        const cW = containerSize.width;
        const cH = containerSize.height;
        const rW = baseSize.width * currentZoom;
        const rH = baseSize.height * currentZoom;

        // Constraint: Image must always cover the viewport
        const minX = cW - rW;
        const maxX = 0;
        const minY = cH - rH;
        const maxY = 0;

        return {
            x: Math.min(maxX, Math.max(minX, x)),
            y: Math.min(maxY, Math.max(minY, y))
        };
    };

    // Zoom handler with mouse/slider value centered zoom
    const handleZoomChange = (newZoom) => {
        const oldZoom = zoom;
        const cW = containerSize.width;
        const cH = containerSize.height;

        // Viewport center
        const vCx = cW / 2;
        const vCy = cH / 2;

        // Keep the center point of the viewport anchored on the same part of the image
        const imgPx = (vCx - position.x) / oldZoom;
        const imgPy = (vCy - position.y) / oldZoom;

        const rawX = vCx - imgPx * newZoom;
        const rawY = vCy - imgPy * newZoom;

        const constrained = getConstrainedPosition(rawX, rawY, newZoom);
        setZoom(newZoom);
        setPosition(constrained);
    };

    // Mouse Drag events
    const handleMouseDown = (e) => {
        if (!imageLoaded) return;
        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const rawX = e.clientX - dragStart.current.x;
        const rawY = e.clientY - dragStart.current.y;
        
        const constrained = getConstrainedPosition(rawX, rawY, zoom);
        setPosition(constrained);
    };

    const handleMouseUpOrLeave = () => {
        isDragging.current = false;
    };

    // Touch Drag events (Mobile support)
    const handleTouchStart = (e) => {
        if (!imageLoaded || e.touches.length !== 1) return;
        isDragging.current = true;
        dragStart.current = {
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        };
    };

    const handleTouchMove = (e) => {
        if (!isDragging.current || e.touches.length !== 1) return;
        const rawX = e.touches[0].clientX - dragStart.current.x;
        const rawY = e.touches[0].clientY - dragStart.current.y;

        const constrained = getConstrainedPosition(rawX, rawY, zoom);
        setPosition(constrained);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    const resetCrop = () => {
        setZoom(1);
        setPosition({
            x: (containerSize.width - baseSize.width) / 2,
            y: (containerSize.height - baseSize.height) / 2
        });
    };

    const handleApply = () => {
        if (!imageLoaded || !imageRef.current) return;

        const cW = containerSize.width;
        const cH = containerSize.height;
        const rW = baseSize.width * zoom;
        const rH = baseSize.height * zoom;

        // Scale relative to original natural resolution
        const scale = rW / naturalSize.width;

        // Source crop coordinates on natural image
        const sx = -position.x / scale;
        const sy = -position.y / scale;
        const sw = cW / scale;
        const sh = cH / scale;

        // High quality output resolution (900x600 for standard 3:2 layout)
        const targetWidth = 900;
        const targetHeight = 600;

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            // Fill with white background just in case of empty pixels
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            
            // Draw image cropped
            ctx.drawImage(
                imageRef.current,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                targetWidth,
                targetHeight
            );

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File([blob], fileName || "product_image.jpg", {
                            type: "image/jpeg",
                            lastModified: Date.now()
                        });
                        onCrop(file);
                    }
                },
                "image/jpeg",
                0.92
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-hidden">
            {/* Background click handler */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Box */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-xl shadow-2xl p-6 flex flex-col gap-5 z-10 transition-all border border-border/40">
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Sesuaikan Gambar Produk</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Geser dan perbesar agar objek makanan fokus di tengah.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Viewport container */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <div 
                        ref={containerRef}
                        className="relative w-full aspect-[3/2] max-w-[450px] overflow-hidden bg-zinc-950 rounded-2xl border border-border/60 shadow-inner select-none cursor-move group"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {imageSrc ? (
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="To Crop"
                                onLoad={handleImageLoad}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    width: `${baseSize.width * zoom}px`,
                                    height: `${baseSize.height * zoom}px`,
                                    transform: `translate(${position.x}px, ${position.y}px)`,
                                    maxWidth: "none",
                                    pointerEvents: "none"
                                }}
                                className="transition-transform duration-75 ease-out"
                            />
                        ) : (
                            <div className="text-center text-xs text-white/50">Memuat gambar...</div>
                        )}

                        {/* Aesthetic grid overlay like Rule of Thirds */}
                        <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-2xl flex flex-col justify-between">
                            <div className="flex-1 w-full border-b border-dashed border-white/15 flex justify-between">
                                <div className="h-full border-r border-dashed border-white/15" style={{ width: "33.33%" }}></div>
                                <div className="h-full border-r border-dashed border-white/15" style={{ width: "33.33%" }}></div>
                            </div>
                            <div className="flex-1 w-full border-b border-dashed border-white/15 flex justify-between">
                                <div className="h-full border-r border-dashed border-white/15" style={{ width: "33.33%" }}></div>
                                <div className="h-full border-r border-dashed border-white/15" style={{ width: "33.33%" }}></div>
                            </div>
                            <div className="flex-1 w-full flex justify-between">
                                <div className="h-full border-r border-dashed border-white/15" style={{ width: "33.33%" }}></div>
                                <div className="h-full border-r border-dashed border-white/15" style={{ width: "33.33%" }}></div>
                            </div>
                        </div>

                        {/* Subtle helper text overlay on hover */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-[10px] text-white/90 px-3 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Geser Gambar dengan Mouse / Jari
                        </div>
                    </div>
                </div>

                {/* Control sliders & buttons */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ZoomOut size={16} className="text-muted-foreground" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={zoom}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <ZoomIn size={16} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground min-w-[32px] text-right">
                            {zoom.toFixed(1)}x
                        </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                        <button
                            type="button"
                            onClick={resetCrop}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold transition-colors py-2 px-3 hover:bg-secondary/40 rounded-lg"
                        >
                            <RotateCcw size={14} />
                            Reset Posisi
                        </button>

                        <div className="flex gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                className="rounded-xl font-bold border border-border/60 hover:bg-secondary transition-colors"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="button" 
                                onClick={handleApply}
                                className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all"
                            >
                                <Check size={16} />
                                Terapkan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
