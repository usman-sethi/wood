import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-[4px] font-bold text-primary">Our Story</span>
            <h1 className="text-5xl md:text-7xl font-heading font-medium tracking-tight">Sethi Woods Art</h1>
          </div>

          {/* Image */}
          <div className="w-full aspect-video bg-secondary overflow-hidden border border-border shadow-2xl relative">
             <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10"></div>
             <img 
               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8nBNWEZ9riINqnQH3sXvIdUhOsmuFknMktA&s" 
               alt="Woodworking mastery" 
               className="w-full h-full object-cover bg-background"
             />
          </div>

          {/* Story Content */}
          <div className="prose prose-lg dark:prose-invert mx-auto leading-relaxed font-sans text-muted-foreground space-y-6">
            <p className="text-xl md:text-2xl text-foreground font-heading">
              Sethi Woods Art started as a passion project in a small workshop, driven by the belief that every pet deserves a home as beautiful as the space it occupies.
            </p>
            <p>
              For years, we've dedicated ourselves to mastering the art of woodworking. What began as simple birdhouses quickly evolved into intricate, architectural aviaries and custom enclosures. We blend traditional craftsmanship with modern design aesthetics to create pieces that aren't just functional, but true works of art.
            </p>
            <p>
              Whether it's a majestic flight cage for your parrot, an expansive playpen for your cat, or an elegant wooden accessory, every item is handmade with love, precision, and entirely pet-safe materials.
            </p>
          </div>

          {/* Contact Details */}
          <div className="border border-border bg-secondary/30 p-8 md:p-12 text-center mt-12 shadow-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
             <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-heading uppercase tracking-widest font-bold">Get In Touch</h3>
                <p className="text-muted-foreground">Ready to commission a custom piece or have questions about our collection?</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 font-mono text-lg md:text-xl">
                  <span className="bg-background px-6 py-3 border border-border shadow-sm">0306 836 9895</span>
                  <span className="hidden sm:block text-muted-foreground/30">|</span>
                  <span className="bg-background px-6 py-3 border border-border shadow-sm">0335 001 0676</span>
                </div>
                <div className="pt-6">
                  <Button render={<Link to="/queries" />} nativeButton={false} size="lg" className="rounded-none uppercase tracking-[2px] font-bold px-8 shadow-xl">
                    Message Us Direct
                  </Button>
                </div>
             </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
