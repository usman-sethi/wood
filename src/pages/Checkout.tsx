import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { googleSheetsMock, Order } from "../services/googleSheets";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Trash2, CheckCircle2, ShoppingCart } from "lucide-react";

export default function Checkout() {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setSubmitting(true);
    
    // Create an order for each distinct item type, or a combined order
    // For simplicity in the admin panel, let's create a combined order text for 'product_name'
    const productNames = cartItems.map(item => `${item.cartQuantity}x ${item.name}`).join(", ");
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

    const newOrder: Order = {
      order_id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...formData,
      product_name: productNames,
      quantity: totalQuantity,
      total: cartTotal,
      status: "Pending",
      date: new Date().toISOString()
    };

    await googleSheetsMock.saveOrder(newOrder);
    
    // Decrease stock for each product (simplified simulation)
    // Normally we'd fetch latest product data, check stock, then update.
    
    clearCart();
    setSubmitting(false);
    setSuccess(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-md text-center">
        <div className="w-20 h-20 bg-green-50 rounded-none border border-green-500 flex items-center justify-center mx-auto mb-6 text-green-500">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 uppercase">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. We have received it and will contact you shortly to arrange delivery.
        </p>
        <Button render={<Link to="/shop" />} nativeButton={false} className="w-full rounded-none h-12 uppercase tracking-wider font-semibold">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-[-1px] mb-10 uppercase">Checkout</h1>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8 bg-[#fafafa] p-6 sm:p-8 border border-border rounded-none">
            <h2 className="text-xl font-bold uppercase tracking-wider text-sm mb-6">Delivery Details</h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-semibold" htmlFor="customer_name">Full Name</Label>
              <Input 
                id="customer_name" 
                name="customer_name" 
                required 
                value={formData.customer_name} 
                onChange={handleChange} 
                className="bg-background rounded-none border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-semibold" htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                value={formData.phone} 
                onChange={handleChange} 
                className="bg-background rounded-none border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-semibold" htmlFor="address">Street Address</Label>
            <Input 
              id="address" 
              name="address" 
              required 
              value={formData.address} 
              onChange={handleChange} 
              className="bg-background rounded-none border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-semibold" htmlFor="city">City / Region</Label>
            <Input 
              id="city" 
              name="city" 
              required 
              value={formData.city} 
              onChange={handleChange} 
              className="bg-background rounded-none border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-semibold" htmlFor="notes">Order Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              rows={3} 
              value={formData.notes} 
              onChange={handleChange} 
              className="bg-background resize-none rounded-none border-border"
            />
          </div>

            <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 rounded-none font-semibold uppercase tracking-wider text-sm mt-4" 
            disabled={submitting || cartItems.length === 0}
          >
              {submitting ? "Processing..." : `Place Order - Rs. ${cartTotal.toLocaleString()}`}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-background border border-border rounded-none overflow-hidden sticky top-24">
            <div className="p-6 border-b border-border bg-[#fafafa]">
              <h2 className="text-xl font-bold uppercase tracking-wider text-sm">Order Summary</h2>
            </div>
            
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                  <Button render={<Link to="/shop" />} nativeButton={false} variant="outline" size="sm" className="rounded-none uppercase tracking-wider text-xs">
                    Browse Shop
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-secondary rounded-none border border-border overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                        <div className="text-xs text-muted-foreground mt-1 text-balance">
                           Qty: {item.cartQuantity} × Rs. {item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">Rs. {(item.price * item.cartQuantity).toLocaleString()}</div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-destructive hover:underline mt-1 inline-flex items-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{cartTotal > 50000 ? 'Free' : 'Rs. 1,000'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-4">
                      <span>Total</span>
                      <span>Rs. {(cartTotal > 50000 ? cartTotal : cartTotal + 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
