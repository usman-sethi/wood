import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "../components/ui/button";
import { ShieldCheck, Truck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Product, googleSheetsMock } from "../services/googleSheets";
import { motion } from "motion/react";

export default function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    googleSheetsMock.getProducts().then(products => {
      setFeaturedProducts(products.slice(0, 3));
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center bg-background overflow-hidden perspective-1000">
        
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/80 rounded-full blur-3xl opacity-50" 
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xs uppercase tracking-[4px] font-bold text-primary block mb-6"
              >
                Sethi Woods Art
              </motion.span>
              <h1 className="text-6xl md:text-7xl lg:text-9xl font-heading font-medium tracking-tight text-foreground leading-[0.9]">
                Pet
                <br />
                <span className="italic font-light text-muted-foreground">Palaces.</span>
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-[450px] leading-relaxed">
              We craft exquisite, hand-made wooden aviaries and pet enclosures. Elevate your space with artisanal quality.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button render={<Link to="/shop" />} nativeButton={false} size="lg" className="rounded-none px-12 h-14 uppercase tracking-[2px] text-xs font-bold shadow-2xl hover:scale-105 transition-transform duration-300">
                Explore Collection
              </Button>
            </motion.div>
          </motion.div>
          
          <div className="relative z-10 flex justify-center lg:justify-end h-full perspective-[2000px]">
            <motion.div 
              initial={{ opacity: 0, rotateY: 30, rotateX: 10, z: -200, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: -15, rotateX: 5, z: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05, transition: { duration: 0.5 } }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full max-w-lg aspect-[3/4] shadow-[0_0_50px_rgba(0,0,0,0.15)] bg-card border-8 border-background"
            >
              <div 
                style={{ transform: "translateZ(30px)" }}
                className="absolute inset-0 bg-primary/20 z-10 pointer-events-none mix-blend-overlay"
              ></div>
              <img 
                src="https://m.media-amazon.com/images/I/71n3hfpV19L.jpg" 
                alt="Artisanal wood craft" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Floating Element */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transform: "translateZ(50px)" }}
                className="absolute -bottom-6 -left-6 bg-background p-6 shadow-xl border border-border"
              >
                <div className="text-xs uppercase tracking-[2px] font-bold text-muted-foreground mb-1">Material</div>
                <div className="font-heading text-xl">Premium Oak</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features - Minimal 3D Cards */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Master Craftsmanship", desc: "Built with generational techniques and premium woods." },
              { icon: Truck, title: "White Glove Delivery", desc: "Safe, secure transport of your pet's new luxury home." },
              { icon: Clock, title: "Bespoke Design", desc: "Tailored to fit your home's aesthetic seamlessly." }
            ].map((feature, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 0.6, delay: i * 0.1 }}
                 whileHover={{ y: -10, transition: { duration: 0.2 } }}
                 className="bg-background p-10 shadow-sm border border-border/50 hover:shadow-2xl transition-all duration-300 group"
               >
                 <div className="h-14 w-14 mb-8 rounded-none bg-secondary flex items-center justify-center transform group-hover:rotate-[15deg] transition-transform duration-300">
                   <feature.icon className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="font-heading text-xl mb-3 tracking-tight">{feature.title}</h3>
                 <p className="text-sm text-muted-foreground font-sans leading-relaxed">{feature.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-[3px] font-bold text-primary block mb-4">Curated Selection</span>
              <h2 className="text-5xl lg:text-7xl font-heading font-medium tracking-tight">Our Collection</h2>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-[3px] hover:text-primary transition-all pb-2 border-b border-foreground hover:border-primary">
              View All Pieces &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-border border border-border">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center sm:hidden">
            <Button render={<Link to="/shop" />} nativeButton={false} variant="outline" size="lg" className="w-full rounded-none tracking-widest uppercase">
              View all products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
