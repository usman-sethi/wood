import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Product, googleSheetsMock } from "../services/googleSheets";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";

const CATEGORIES = ["All", "Bird Cages", "Cat Cages", "Dog Cages", "Rabbit Cages", "Accessories"];

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    googleSheetsMock.getProducts().then(data => {
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter by Search
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, sortBy, products]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col mb-16 px-4">
        <span className="text-[10px] uppercase tracking-[4px] font-bold text-primary/50 mb-4 ml-1">Archive</span>
        <h1 className="text-6xl md:text-8xl font-heading font-medium tracking-[-2px] leading-[1] text-foreground uppercase">
          Collections.
        </h1>
        <div className="h-1 w-32 bg-primary mt-6 mb-8"></div>
        <p className="text-muted-foreground text-sm tracking-wide max-w-lg italic font-sans">
          Curated woodcraft and specialized habitats designed for those who appreciate fine form and function.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-8 border-b border-border">
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar cursor-pointer">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-none text-xs uppercase tracking-widest whitespace-nowrap transition-colors border ${
                activeCategory === cat 
                  ? "bg-primary text-primary-foreground font-semibold border-primary" 
                  : "bg-transparent hover:bg-secondary text-foreground border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9 bg-transparent border-border rounded-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-transparent border-border rounded-none text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-border border border-border">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="animate-pulse bg-background p-4 flex flex-col justify-between">
              <div className="aspect-[4/3] bg-secondary mb-4"></div>
              <div className="h-4 bg-secondary w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 border border-border bg-secondary/30">
          <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-border border border-border">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
