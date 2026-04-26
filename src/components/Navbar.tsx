import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, MessageSquare, LogIn, LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Navbar() {
  const { user, login, logout, isAdmin } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", name: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email) return;
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.name);
      setIsLoginOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold tracking-[-1px] uppercase flex items-center gap-1">
              SETHI <span className="font-light text-muted-foreground italic">WOODs</span> <span className="text-primary font-black">ART</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-8">
            <Link to="/" className="text-xs uppercase tracking-widest font-semibold transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/about" className="text-xs uppercase tracking-widest font-semibold transition-colors hover:text-primary border-l pl-8 border-border">
              Story
            </Link>
            <Link to="/shop" className="text-xs uppercase tracking-widest font-semibold transition-colors hover:text-primary border-l pl-8 border-border">
              Shop
            </Link>
            <Link to="/queries" className="text-xs uppercase tracking-widest font-semibold transition-colors hover:text-primary border-l pl-8 border-border">
              Contact
            </Link>
            
            {isAdmin && (
              <Link to="/admin" className="text-xs uppercase tracking-widest font-semibold text-primary transition-colors hover:opacity-70 border-l pl-8 border-border flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Admin
              </Link>
            )}

            <div className="border-l pl-8 border-border">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">{user.name || user.email}</span>
                  <Button variant="ghost" size="sm" onClick={logout} className="h-8 px-2 rounded-none hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsLoginOpen(true)} className="rounded-none h-8 text-[10px] uppercase tracking-widest font-bold">
                  <LogIn className="h-3 w-3 mr-2" /> Sign In
                </Button>
              )}
            </div>
          </div>

          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogContent className="rounded-none border-border sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="uppercase tracking-widest text-lg font-bold">Artist's Studio Login</DialogTitle>
                <DialogDescription className="italic text-xs">
                  Connect to access exclusive pieces and your history.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLogin} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Your Name (for new users)" 
                      className="rounded-none italic h-12"
                      value={loginForm.name}
                      onChange={e => setLoginForm({...loginForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      placeholder="your@email.com" 
                      className="rounded-none h-12"
                      value={loginForm.email}
                      onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-none uppercase tracking-widest text-xs font-bold">
                  {loading ? "Establishing Connection..." : "Enter Studio"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden rounded-none hover:bg-secondary border border-transparent hover:border-border transition-colors">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[85vw] sm:max-w-md border-l border-border bg-background p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-border bg-secondary/30">
                  <SheetTitle className="text-left font-bold tracking-[-1px] uppercase flex items-center gap-1">
                    SETHI <span className="font-light text-muted-foreground italic">WOODs</span> <span className="text-primary font-black">ART</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto flex flex-col p-6 space-y-6">
                  <div className="flex flex-col space-y-2">
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="py-3 items-center flex text-sm uppercase tracking-[3px] font-bold border-b border-border hover:text-primary transition-colors">Home <span className="ml-auto text-muted-foreground opacity-50">&rarr;</span></Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/about" className="py-3 items-center flex text-sm uppercase tracking-[3px] font-bold border-b border-border hover:text-primary transition-colors">Our Story <span className="ml-auto text-muted-foreground opacity-50">&rarr;</span></Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop" className="py-3 items-center flex text-sm uppercase tracking-[3px] font-bold border-b border-border hover:text-primary transition-colors">Shop Collection <span className="ml-auto text-muted-foreground opacity-50">&rarr;</span></Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/queries" className="py-3 items-center flex text-sm uppercase tracking-[3px] font-bold border-b border-border hover:text-primary transition-colors">Contact <span className="ml-auto text-muted-foreground opacity-50">&rarr;</span></Link>
                    {isAdmin && (
                      <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin" className="py-3 items-center flex text-sm uppercase tracking-[3px] font-bold text-primary border-b border-border hover:opacity-80 transition-colors">
                        Admin Panel <ShieldCheck className="h-4 w-4 ml-auto" />
                      </Link>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-6 pb-6">
                    {user ? (
                      <div className="space-y-4 bg-secondary/50 p-4 border border-border">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Logged in as</p>
                          <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full rounded-none justify-center h-10 uppercase tracking-widest text-[10px] font-bold border-border bg-background" onClick={() => { setIsMobileMenuOpen(false); logout(); }}>
                          <LogOut className="h-3 w-3 mr-2" /> Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full rounded-none h-12 uppercase tracking-[2px] text-xs font-bold" onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }}>
                        <LogIn className="h-4 w-4 mr-2" /> Enter Studio
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
