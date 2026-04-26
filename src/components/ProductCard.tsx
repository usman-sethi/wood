import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Product } from "../services/googleSheets";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const images = product.image ? product.image.split(',').map(s => s.trim()).filter(Boolean) : [];
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <Card className="group overflow-hidden border-none hover:bg-secondary transition-colors duration-500 rounded-none bg-background flex flex-col p-4 md:p-6">
      <Link to={`/product/${product.id}`} className="flex-1 select-none flex flex-col cursor-pointer">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-4 md:mb-8 border border-border/40 shadow-sm transition-all group-hover:shadow-2xl">
          {images.length > 0 && (
            <img 
              src={images[currentImageIdx]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          )}

          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handlePrev}
                className="bg-background/80 hover:bg-background text-foreground shrink-0 rounded-none h-8 w-8 flex items-center justify-center border border-border"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext}
                className="bg-background/80 hover:bg-background text-foreground shrink-0 rounded-none h-8 w-8 flex items-center justify-center border border-border"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="destructive" className="absolute top-4 left-4 rounded-none uppercase text-[9px] tracking-[2px] px-3 py-1 bg-red-600/90 border-none shadow-lg outline-none ring-0">
              Limited
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute top-4 left-4 rounded-none uppercase text-[9px] tracking-[2px] border border-border bg-background/90 px-3 py-1 shadow-lg">
              Sold Out
            </Badge>
          )}
        </div>
        <CardContent className="p-0 flex-1 flex flex-col pointer-events-none">
          <div className="flex flex-col mb-4">
            <span className="text-[9px] md:text-[10px] uppercase tracking-[2px] font-bold text-muted-foreground mb-1">
              {product.category}
            </span>
            <h3 className="font-heading text-lg md:text-2xl tracking-tight line-clamp-1 leading-tight text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
             <span className="text-sm md:text-lg font-heading italic">Rs. {product.price.toLocaleString()}</span>
             <span className="hidden sm:inline-block text-[9px] md:text-[10px] font-bold uppercase tracking-[2px] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
               View Piece &rarr;
             </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
