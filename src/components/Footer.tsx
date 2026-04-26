import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-[-1px] uppercase">SETHI WOODS <span className="font-light text-muted-foreground italic">ART.</span></h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium quality cages and handcrafted wooden products for your beloved pets. Designed for comfort, built for durability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-widest text-xs">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Pigeon Cages</li>
              <li>Parrot Cages</li>
              <li>Cat Cages</li>
              <li>Handcrafted Accessories</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-widest text-xs">Contact & Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground hover:underline transition-all">About Us</Link></li>
              <li><a href="/queries" className="hover:text-foreground hover:underline transition-all">Submit a Query</a></li>
              <li className="font-mono text-xs">0306 836 9895</li>
              <li className="font-mono text-xs">0335 001 0676</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-[2px]">
          <span>&copy; {new Date().getFullYear()} Sethi Woods Art.</span>
          <span>Crafted with Wood & Passion.</span>
        </div>
      </div>
    </footer>
  );
}
