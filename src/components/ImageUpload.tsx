import React, { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onCloudinaryClick?: () => void;
  multiple?: boolean;
}

export function ImageUpload({ value, onChange, onCloudinaryClick, multiple = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const images = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (onCloudinaryClick) {
        onCloudinaryClick();
      }
    }
  }, [onCloudinaryClick]);

  const handleUrlSubmit = () => {
    if (urlValue) {
      if (multiple && value) {
        onChange(value + "," + urlValue);
      } else {
        onChange(urlValue);
      }
      setUrlValue("");
      setShowUrlInput(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    onChange(newImages.join(","));
  };

  return (
    <div className="space-y-4 w-full">
      <Label>Product {multiple ? "Images" : "Image"}</Label>
      
      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {images.map((imgUrl, index) => (
            <div key={index} className="relative group aspect-video w-full overflow-hidden border border-border bg-secondary">
              <img src={imgUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="rounded-none uppercase tracking-widest text-[10px]"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!images.length || multiple) && (
        <div 
          className={`
            relative aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed transition-all
            ${dragActive ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onCloudinaryClick}
        >
          <div className="flex flex-col items-center text-center p-6 cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider mb-1">Drag and drop or click to upload</p>
            <p className="text-xs text-muted-foreground">Supported via Cloudinary Widget</p>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center pb-2">
            <Button 
               type="button"
               variant="ghost" 
               size="sm" 
               className="text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-primary"
               onClick={(e) => {
                 e.stopPropagation();
                 setShowUrlInput(true);
               }}
            >
              <LinkIcon className="h-3 w-3 mr-1" /> Or use Image URL
            </Button>
          </div>
        </div>
      )}

      {showUrlInput && (
        <div className="p-4 border border-border bg-background animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
             <Label htmlFor="url-input" className="text-xs uppercase tracking-widest">External Image URL</Label>
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowUrlInput(false)}>
               <X className="h-3 w-3" />
             </Button>
          </div>
          <div className="flex gap-2">
            <Input 
              id="url-input"
              placeholder="https://images.unsplash.com/..." 
              value={urlValue} 
              onChange={(e) => setUrlValue(e.target.value)}
              className="h-9 text-xs"
            />
            <Button size="sm" type="button" className="rounded-none h-9 px-4" onClick={handleUrlSubmit}>
              Apply
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs p-2 bg-destructive/5 border border-destructive/20 mt-2">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

const Pencil = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);
