import { useState, FormEvent } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { googleSheetsMock } from "../services/googleSheets";
import { CheckCircle2 } from "lucide-react";

export default function Queries() {
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await googleSheetsMock.saveQuery({
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message
      });
      setSubmitted(true);
      setFormData({ customer_name: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error("Error saving query:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold uppercase tracking-tight mb-4">Message Sent</h2>
        <p className="text-muted-foreground mb-8">Thank you for reaching out. We will get back to you shortly at the number provided.</p>
        <Button onClick={() => setSubmitted(false)} className="rounded-none uppercase tracking-widest px-8">Send another message</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
      <div className="flex flex-col mb-16 px-4">
        <span className="text-[10px] uppercase tracking-[4px] font-bold text-primary/50 mb-4 ml-1">Consultation</span>
        <h1 className="text-6xl md:text-8xl font-heading font-medium tracking-[-2px] leading-[1] text-foreground uppercase">
          Inquire.
        </h1>
        <div className="h-1 w-32 bg-primary mt-6 mb-8"></div>
        <p className="text-muted-foreground text-sm tracking-wide max-w-lg italic font-sans">
          Have a specific vision or need a bespoke artisanal piece? Reach out to our craftsmen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-background p-10 border border-border shadow-2xl relative">
        <div className="absolute -top-4 -right-4 h-12 w-12 bg-primary flex items-center justify-center text-white font-heading italic text-xl">
          S
        </div>
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[10px] uppercase tracking-[2px] font-bold text-primary/60">Full Name</Label>
          <Input 
            id="name" 
            required 
            placeholder="Identity"
            className="rounded-none bg-background border-border h-12 italic focus:border-primary transition-all"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="phone" className="text-[10px] uppercase tracking-[2px] font-bold text-primary/60">Phone Number</Label>
          <Input 
            id="phone" 
            required 
            placeholder="Contact Reference"
            className="rounded-none bg-background border-border h-12 italic focus:border-primary transition-all"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-[10px] uppercase tracking-[2px] font-bold text-primary/60">Email Address</Label>
          <Input 
            id="email" 
            type="email"
            placeholder="Electronic Mail (Optional)"
            className="rounded-none bg-background border-border h-12 italic focus:border-primary transition-all"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="message" className="text-[10px] uppercase tracking-[2px] font-bold text-primary/60">Your Message</Label>
          <Textarea 
            id="message" 
            required 
            placeholder="Vision & Requirements"
            className="rounded-none bg-background border-border min-h-[180px] italic focus:border-primary transition-all"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full h-16 rounded-none uppercase tracking-[3px] font-bold text-xs shadow-xl hover:scale-[1.01] transition-all"
        >
          {loading ? "Transmitting..." : "Send Inquiry"}
        </Button>
      </form>
    </div>
  );
}
