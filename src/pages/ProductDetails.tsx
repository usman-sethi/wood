import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product, googleSheetsMock } from "../services/googleSheets";
import { Button } from "../components/ui/button";
import { ArrowLeft, ArrowRight, Check, HandHeart, MessageCircle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    googleSheetsMock.getProducts().then(products => {
      const found = products.find(p => p.id === id);
      setProduct(found || null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const contactNumbers = ["0300000000", "03350010676"];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrderNow = async () => {
    setOrderDialogOpen(true);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const images = product.image ? product.image.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-4 w-full overflow-hidden">
          <div className="relative group bg-secondary rounded-none border border-border">
            <div className="overflow-hidden aspect-square" ref={emblaRef}>
              <div className="flex select-none h-full touch-pan-y">
                {images.length > 0 ? (
                  images.map((img, i) => (
                    <div className="flex-[0_0_100%] min-w-0 relative" key={i}>
                      <img 
                        src={img} 
                        alt={`${product.name} ${i + 1}`} 
                        className="absolute w-full h-full object-cover block"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex-[0_0_100%] min-w-0" />
                )}
              </div>
            </div>
            
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-none border border-border z-10"
                  onClick={scrollPrev}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-none border border-border z-10"
                  onClick={scrollNext}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`aspect-square overflow-hidden border ${selectedIndex === i ? 'border-primary border-2 opacity-100' : 'border-border opacity-70 hover:opacity-100'} transition-all`}
                  onClick={() => scrollTo(i)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <Badge className="w-fit mb-4 rounded-none uppercase tracking-[2px] text-[9px] px-3 py-1 font-bold" variant="secondary">{product.category}</Badge>
          <h1 className="text-5xl sm:text-7xl font-heading font-medium tracking-[-2px] mb-6 leading-[1.1]">{product.name}</h1>
          <div className="text-3xl font-heading italic mb-8 border-b border-border pb-8 text-primary/80">Rs. {product.price.toLocaleString()}</div>
          
          <div className="text-base text-muted-foreground mb-12 leading-loose max-w-prose italic font-sans">
            <p>{product.description}</p>
          </div>

          <div className="mt-auto space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[3px] font-bold text-primary/40 mb-6">Acquire Piece</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleOrderNow}
                  size="lg" 
                  className="flex-1 rounded-none uppercase tracking-[2px] font-bold text-xs h-16 transition-all duration-300 shadow-xl hover:scale-[1.02]"
                >
                  <HandHeart className="mr-2 h-5 w-5" /> Order Now
                </Button>
                <Button
                  onClick={() => navigate('/queries')}
                  variant="outline"
                  size="lg"
                  className="rounded-none uppercase tracking-[2px] font-bold text-xs h-16 border-primary/20 hover:bg-primary/5 sm:w-1/3"
                >
                  Custom Request
                </Button>
              </div>
            </div>
            
            {product.stock === 0 && (
              <p className="text-destructive text-xs font-bold uppercase tracking-widest text-center">Currently Archiving / Sold Out</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="rounded-none sm:max-w-md border-border p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal tracking-[-1px] mb-2 font-heading">Complete Order</DialogTitle>
            <DialogDescription className="text-sm font-mono tracking-tight opacity-70">
              To place your order for "{product.name}", please contact us on WhatsApp using either of the numbers below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-8">
            <a 
              href="https://wa.me/923068369895" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-border p-4 hover:bg-secondary/20 transition-colors group"
            >
              <span className="font-mono text-sm tracking-tight">+92 306 836 9895</span>
              <span className="text-[10px] uppercase tracking-widest font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> Message
              </span>
            </a>
            <a 
              href="https://wa.me/923350010676" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-border p-4 hover:bg-secondary/20 transition-colors group"
            >
              <span className="font-mono text-sm tracking-tight">+92 335 001 0676</span>
              <span className="text-[10px] uppercase tracking-widest font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> Message
              </span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
