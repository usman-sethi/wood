import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Product, Order, SiteUser, SiteQuery, googleSheetsMock } from "../services/googleSheets";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Settings, Package, ShoppingBag, Plus, Pencil, Trash2, Users, MessageSquare, Upload, Search, Filter, MoreVertical, ExternalLink } from "lucide-react";
import { ImageUpload } from "../components/ImageUpload";

export default function Admin() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [queries, setQueries] = useState<SiteQuery[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{type: 'product' | 'order' | 'user' | 'query', id: string} | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'product' | 'order' | 'user' | 'query', id: string, name?: string} | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && hoveredItem) {
        e.preventDefault();
        if (hoveredItem.type === 'product') promptDelete('product', hoveredItem.id);
        else if (hoveredItem.type === 'user') {
          const u = users.find(x => x.id === hoveredItem.id);
          if (u) promptDelete('user', u.id, u.role);
        }
        else if (hoveredItem.type === 'order') promptDelete('order', hoveredItem.id);
        else if (hoveredItem.type === 'query') promptDelete('query', hoveredItem.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredItem, users]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchData = async (background = false) => {
    if (!background && products.length === 0) setLoading(true);
    try {
      const [pData, oData, uData, qData] = await Promise.all([

        googleSheetsMock.getProducts(),
        googleSheetsMock.getOrders(),
        googleSheetsMock.getUsers(),
        googleSheetsMock.getQueries()
      ]);
      setProducts(pData);
      setOrders(oData);
      setUsers(uData);
      setQueries(qData);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({...product});
    } else {
      setEditingProduct(null);
      setFormData({
        id: `p${Date.now()}`,
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "Bird Cages",
        stock: 0
      });
    }
    setIsDialogOpen(true);
  };

  const openCloudinaryWidget = () => {
    if ('cloudinary' in window) {
      const widget = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'df3pf5rhm',
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'paradox',
          sources: ['local', 'url', 'camera'],
          multiple: true,
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            setFormData(prev => {
              const currentImages = prev.image ? prev.image.split(',').map(s => s.trim()).filter(Boolean) : [];
              currentImages.push(result.info.secure_url);
              return { ...prev, image: currentImages.join(',') };
            });
          }
        }
      );
      widget.open();
    } else {
      alert('Cloudinary widget not loaded yet. Please try again.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.price !== undefined) {
      setIsSaving(true);
      try {
        await googleSheetsMock.saveProduct(formData as Product);
        setIsDialogOpen(false);
        await fetchData(true);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const promptDelete = (type: 'product' | 'order' | 'user' | 'query', id: string, role?: string) => {
    if (type === 'user' && role === 'Admin') {
      alert("Cannot delete an Admin user.");
      return;
    }
    
    // Find name for better dialog context
    let name = "this item";
    if (type === 'product') name = products.find(p => p.id === id)?.name || "this product";
    else if (type === 'order') name = `order #${id}`;
    else if (type === 'user') name = users.find(u => u.id === id)?.name || "this user";
    else if (type === 'query') name = queries.find(q => q.id === id)?.customer_name ? `query from ${queries.find(q => q.id === id)?.customer_name}` : "this query";
    
    setItemToDelete({ type, id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    setDeletingId(id);
    try {
      if (type === 'product') {
        setProducts(prev => prev.filter(p => p.id !== id));
        await googleSheetsMock.deleteProduct(id);
      } else if (type === 'user') {
        setUsers(prev => prev.filter(u => u.id !== id));
        await googleSheetsMock.deleteUser(id);
      } else if (type === 'order') {
        setOrders(prev => prev.filter(o => o.order_id !== id));
        await googleSheetsMock.deleteOrder(id);
      } else if (type === 'query') {
        setQueries(prev => prev.filter(q => q.id !== id));
        await googleSheetsMock.deleteQuery(id);
      }
    } finally {
      setDeletingId(null);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateOrderStatus = async (order: Order) => {
    const newStatus = order.status === "Pending" ? "Completed" : "Pending";
    await googleSheetsMock.saveOrder({ ...order, status: newStatus });
    fetchData();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            SETHI <span className="font-light">WOODs</span> <span className="text-primary italic">ART</span>
          </h1>
          <p className="text-muted-foreground mt-1 uppercase tracking-widest text-[10px] font-semibold opacity-70 flex items-center gap-2">
            Control Center / Dashboard
            {loading && <span className="inline-flex animate-pulse text-primary font-bold"> - Syncing...</span>}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-none uppercase tracking-widest text-xs h-12 px-6">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-secondary/20 border-b-0 p-1 h-auto rounded-none flex-nowrap inline-flex">
            <TabsTrigger value="products" className="rounded-none px-4 sm:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs font-bold whitespace-nowrap">
              <Package className="h-3.5 w-3.5" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-none px-4 sm:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs font-bold whitespace-nowrap">
              <ShoppingBag className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none px-4 sm:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs font-bold whitespace-nowrap">
              <Users className="h-3.5 w-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="queries" className="rounded-none px-4 sm:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs font-bold whitespace-nowrap">
              <MessageSquare className="h-3.5 w-3.5" />
              Queries
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products" className="space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#fafafa] p-4 sm:p-6 border border-border rounded-none gap-4">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">Products ({products.length})</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-70">Inventory Control</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={() => handleOpenDialog()} variant="default" size="sm" className="w-full sm:w-auto rounded-none uppercase tracking-widest text-[10px] h-10 px-6">
                <Plus className="h-3.5 w-3.5 mr-2" /> New Product
              </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px] rounded-none border border-border">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-widest text-sm font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveProduct} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1 pr-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Product Name</Label>
                    <Input id="name" required placeholder="e.g. Premium Bird Aviary" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-none border-border/60" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Description</Label>
                    <Textarea 
                      id="description" 
                      required 
                      placeholder="Product details, wood type, dimensions..." 
                      rows={3} 
                      value={formData.description || ""} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="rounded-none border-border/60 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Price (Rs.)</Label>
                      <Input id="price" type="number" required min="0" step="1" value={formData.price === 0 ? "" : formData.price} onChange={e => setFormData({...formData, price: e.target.value === "" ? 0 : Number(e.target.value)})} className="rounded-none border-border/60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Stock Quantity</Label>
                      <Input id="stock" type="number" required min="0" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="rounded-none border-border/60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      className="flex h-10 w-full rounded-none border border-border bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.category || "Bird Cages"}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Bird Cages">Bird Cages</option>
                      <option value="Cat Cages">Cat Cages</option>
                      <option value="Dog Cages">Dog Cages</option>
                      <option value="Rabbit Cages">Rabbit Cages</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <ImageUpload 
                      value={formData.image || ""} 
                      onChange={(val) => setFormData({...formData, image: val})}
                      onCloudinaryClick={openCloudinaryWidget}
                      multiple={true}
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : editingProduct ? 'Save Product' : 'Add Product'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-border rounded-none overflow-x-auto bg-background">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-secondary/30 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px] uppercase tracking-widest text-[10px] font-bold">Preview</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Details</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold text-center">Category</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Price</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Stock</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="group transition-colors hover:bg-secondary/5"
                    onMouseEnter={() => setHoveredItem({ type: 'product', id: product.id })}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <TableCell>
                      <div className="h-12 w-12 rounded-none border border-border overflow-hidden bg-secondary relative">
                        {product.image && <img src={product.image.split(',')[0].trim()} alt="" className="w-full h-full object-cover" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider line-clamp-1">{product.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-none border-primary/20 text-primary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">Rs. {product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={product.stock === 0 ? "destructive" : product.stock < 5 ? "secondary" : "outline"} 
                        className="font-mono text-[10px] rounded-none border-none py-0.5"
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => handleOpenDialog(product)} disabled={deletingId === product.id}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none" onClick={() => promptDelete('product', product.id)} disabled={deletingId === product.id}>
                          {deletingId === product.id ? <span className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent rounded-full" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6 animate-in fade-in-50">
           <div className="bg-[#fafafa] p-6 border border-border rounded-none">
            <h2 className="text-xl font-bold uppercase tracking-tight">Orders ({orders.length})</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-70">Transaction History</p>
          </div>

          <div className="border border-border rounded-none overflow-x-auto bg-background">
             <Table className="min-w-[1000px]">
              <TableHeader className="bg-secondary/30 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Order ID</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Customer</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Delivery Info</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Products</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Total</TableHead>
                  <TableHead className="text-center uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground uppercase tracking-widest text-xs italic">
                      No matching orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow 
                      key={order.order_id} 
                      className="hover:bg-secondary/5 transition-colors group"
                      onMouseEnter={() => setHoveredItem({ type: 'order', id: order.order_id })}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{order.order_id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-sm tracking-tight">{order.customer_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{order.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] font-semibold">{order.city}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[180px]" title={order.address}>{order.address}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] line-clamp-2 max-w-[200px] leading-tight" title={order.product_name}>
                          {order.product_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">Rs. {order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={order.status === 'Completed' ? 'default' : 'secondary'} 
                          className={`font-bold uppercase tracking-widest text-[9px] rounded-none px-2 py-0.5 ${order.status === 'Completed' ? 'bg-green-600' : 'bg-primary/10 text-primary'}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                         <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-none uppercase tracking-widest text-[9px] h-7 font-bold px-3 border-primary/20 text-primary hover:bg-primary hover:text-white mr-1 inline-flex"
                          onClick={() => handleUpdateOrderStatus(order)}
                        >
                          {order.status === 'Pending' ? 'Complete' : 'Re-open'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none inline-flex" 
                          onClick={() => promptDelete('order', order.order_id)} 
                          disabled={deletingId === order.order_id}
                        >
                          {deletingId === order.order_id ? <span className="h-3 w-3 animate-spin border-2 border-current border-t-transparent rounded-full" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 animate-in fade-in-50">
           <div className="bg-[#fafafa] p-6 border border-border rounded-none">
            <h2 className="text-xl font-bold uppercase tracking-tight">Users ({users.length})</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-70">Client & Staff Management</p>
          </div>

          <div className="border border-border rounded-none overflow-x-auto bg-background">
             <Table className="min-w-[800px]">
              <TableHeader className="bg-secondary/30 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">User ID</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Identity</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Access Level</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Registration</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground uppercase tracking-widest text-xs italic">
                      No user records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-secondary/5 transition-colors"
                      onMouseEnter={() => setHoveredItem({ type: 'user', id: user.id })}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{user.id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-sm tracking-tight">{user.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'Admin' ? 'default' : 'outline'} 
                          className={`font-bold uppercase tracking-widest text-[9px] rounded-none px-2 py-0.5 ${user.role === 'Admin' ? 'bg-black text-white' : ''}`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[10px] font-mono text-muted-foreground">
                        {new Date(user.joined).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'Admin' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none inline-flex" 
                            onClick={() => promptDelete('user', user.id, user.role)} 
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? <span className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent rounded-full" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6 animate-in fade-in-50">
           <div className="bg-[#fafafa] p-6 border border-border rounded-none">
            <h2 className="text-xl font-bold uppercase tracking-tight">Queries ({queries.length})</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-70">Direct Messages</p>
          </div>

          <div className="border border-border rounded-none overflow-x-auto bg-background">
             <Table className="min-w-[900px]">
              <TableHeader className="bg-secondary/30 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold">Contact</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold w-[40%]">Message</TableHead>
                  <TableHead className="uppercase tracking-widest text-[10px] font-bold text-center">Status</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Received At</TableHead>
                  <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground uppercase tracking-widest text-xs italic">
                      No customer queries available.
                    </TableCell>
                  </TableRow>
                ) : (
                  queries.map((query) => (
                    <TableRow 
                      key={query.id} 
                      className="hover:bg-secondary/5 transition-colors group"
                      onMouseEnter={() => setHoveredItem({ type: 'query', id: query.id })}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <TableCell>
                        <div className="font-bold text-sm tracking-tight">{query.customer_name}</div>
                        <div className="flex flex-col gap-0.5">
                          <div className="font-mono text-[10px] text-muted-foreground">{query.phone}</div>
                          <div className="text-[10px] text-muted-foreground/70">{query.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] leading-relaxed max-w-md bg-secondary/20 p-2 border-l-2 border-primary/20" title={query.message}>
                          {query.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={query.status === 'Resolved' ? 'default' : 'secondary'} className="font-bold uppercase tracking-widest text-[9px] rounded-none px-2 py-0.5">
                          {query.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[10px] font-mono text-muted-foreground">
                        {new Date(query.date).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none inline-flex" 
                          onClick={() => promptDelete('query', query.id)} 
                          disabled={deletingId === query.id}
                        >
                          {deletingId === query.id ? <span className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent rounded-full" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button 
          onClick={() => handleOpenDialog()} 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading tracking-tight">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs opacity-70">
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default" className="rounded-none text-xs uppercase tracking-widest font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="rounded-none text-xs uppercase tracking-widest font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
