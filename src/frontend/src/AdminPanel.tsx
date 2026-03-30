import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  LogIn,
  Package,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Category, Product, StoreInfo } from "./backend.d";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAddCategory,
  useAddProduct,
  useCategories,
  useDeleteCategory,
  useDeleteProduct,
  useIsAdmin,
  useProducts,
  useStoreInfo,
  useUpdateCategory,
  useUpdateProduct,
  useUpdateStoreInfo,
} from "./hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Image Upload Button ──────────────────────────────────────────────────────
function ImageUploadCell({
  currentUrl,
  onUpload,
  isUploading,
}: {
  currentUrl: string;
  onUpload: (dataUrl: string) => Promise<void>;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    await onUpload(dataUrl);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg border border-border overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        data-ocid="admin.upload_button"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="text-xs h-8"
      >
        {isUploading ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <Upload className="w-3 h-3 mr-1" />
        )}
        {isUploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();
  const [uploadingId, setUploadingId] = useState<bigint | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    priceUSD: "",
    moq: "",
    categoryId: "",
  });

  const handleUpload = async (product: Product, dataUrl: string) => {
    setUploadingId(product.id);
    try {
      await updateProduct.mutateAsync({ ...product, imageUrl: dataUrl });
      toast.success("Image updated!");
    } catch {
      toast.error("Failed to update image.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.priceUSD || !newProduct.moq) return;
    try {
      await addProduct.mutateAsync({
        id: 0n,
        name: newProduct.name,
        priceUSD: Number.parseFloat(newProduct.priceUSD),
        moq: BigInt(newProduct.moq || "1"),
        categoryId: BigInt(newProduct.categoryId || "1"),
        imageUrl: "",
        rating: 4.5,
      });
      toast.success("Product added!");
      setAddOpen(false);
      setNewProduct({ name: "", priceUSD: "", moq: "", categoryId: "" });
    } catch {
      toast.error("Failed to add product.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products?.length ?? 0} products
        </p>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="products.open_modal_button">
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="products.dialog">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  data-ocid="products.name.input"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Silk Wrap Blouse"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (USD)</Label>
                  <Input
                    data-ocid="products.price.input"
                    type="number"
                    value={newProduct.priceUSD}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, priceUSD: e.target.value }))
                    }
                    placeholder="18.50"
                  />
                </div>
                <div>
                  <Label>MOQ</Label>
                  <Input
                    data-ocid="products.moq.input"
                    type="number"
                    value={newProduct.moq}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, moq: e.target.value }))
                    }
                    placeholder="12"
                  />
                </div>
              </div>
              <div>
                <Label>Category ID</Label>
                <Input
                  data-ocid="products.category.input"
                  type="number"
                  value={newProduct.categoryId}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, categoryId: e.target.value }))
                  }
                  placeholder="1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddOpen(false)}
                data-ocid="products.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={addProduct.isPending}
                data-ocid="products.submit_button"
              >
                {addProduct.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="products.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(products ?? []).map((product, i) => (
            <div
              key={String(product.id)}
              data-ocid={`products.item.${i + 1}`}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
            >
              <ImageUploadCell
                currentUrl={product.imageUrl}
                onUpload={(url) => handleUpload(product, url)}
                isUploading={uploadingId === product.id}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${product.priceUSD.toFixed(2)} · MOQ {String(product.moq)}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Cat #{String(product.categoryId)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8"
                onClick={() => handleDelete(product.id)}
                data-ocid={`products.delete_button.${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(products ?? []).length === 0 && (
            <div
              className="text-center py-12 text-muted-foreground text-sm"
              data-ocid="products.empty_state"
            >
              No products yet. Add your first product.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────
function CategoriesTab() {
  const { data: categories, isLoading } = useCategories();
  const updateCategory = useUpdateCategory();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();
  const [uploadingId, setUploadingId] = useState<bigint | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "" });

  const handleUpload = async (cat: Category, dataUrl: string) => {
    setUploadingId(cat.id);
    try {
      await updateCategory.mutateAsync({ ...cat, imageUrl: dataUrl });
      toast.success("Category image updated!");
    } catch {
      toast.error("Failed to update image.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted.");
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  const handleAdd = async () => {
    if (!newCat.name) return;
    try {
      await addCategory.mutateAsync({
        id: 0n,
        name: newCat.name,
        description: newCat.description,
        imageUrl: "",
      });
      toast.success("Category added!");
      setAddOpen(false);
      setNewCat({ name: "", description: "" });
    } catch {
      toast.error("Failed to add category.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories?.length ?? 0} categories
        </p>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="categories.open_modal_button">
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="categories.dialog">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  data-ocid="categories.name.input"
                  value={newCat.name}
                  onChange={(e) =>
                    setNewCat((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Women's Collection"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  data-ocid="categories.description.input"
                  value={newCat.description}
                  onChange={(e) =>
                    setNewCat((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="e.g. Elegant blouses, dresses & co-ords"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddOpen(false)}
                data-ocid="categories.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={addCategory.isPending}
                data-ocid="categories.submit_button"
              >
                {addCategory.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="categories.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(categories ?? []).map((cat, i) => (
            <div
              key={String(cat.id)}
              data-ocid={`categories.item.${i + 1}`}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
            >
              <ImageUploadCell
                currentUrl={cat.imageUrl}
                onUpload={(url) => handleUpload(cat, url)}
                isUploading={uploadingId === cat.id}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {cat.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {cat.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8"
                onClick={() => handleDelete(cat.id)}
                data-ocid={`categories.delete_button.${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(categories ?? []).length === 0 && (
            <div
              className="text-center py-12 text-muted-foreground text-sm"
              data-ocid="categories.empty_state"
            >
              No categories yet. Add your first category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Store Info Tab ───────────────────────────────────────────────────────────
function StoreInfoTab() {
  const { data: storeInfo, isLoading } = useStoreInfo();
  const updateStoreInfo = useUpdateStoreInfo();
  const [form, setForm] = useState<StoreInfo>({
    address: "",
    city: "",
    phone: "",
    email: "",
    businessHours: "",
  });
  const [loaded, setLoaded] = useState(false);

  if (storeInfo && !loaded) {
    setForm(storeInfo);
    setLoaded(true);
  }

  const handleSave = async () => {
    try {
      await updateStoreInfo.mutateAsync(form);
      toast.success("Store info saved!");
    } catch {
      toast.error("Failed to save store info.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="storeinfo.loading_state">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <Label>Address</Label>
        <Input
          data-ocid="storeinfo.address.input"
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          placeholder="42 Fashion District Lane"
        />
      </div>
      <div>
        <Label>City</Label>
        <Input
          data-ocid="storeinfo.city.input"
          value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          placeholder="Mumbai"
        />
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          data-ocid="storeinfo.phone.input"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+91 98765 43210"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          data-ocid="storeinfo.email.input"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="hello@alookover.com"
        />
      </div>
      <div>
        <Label>Business Hours</Label>
        <Textarea
          data-ocid="storeinfo.hours.textarea"
          value={form.businessHours}
          onChange={(e) =>
            setForm((p) => ({ ...p, businessHours: e.target.value }))
          }
          placeholder="Mon–Sat: 9:00 AM – 7:00 PM"
          rows={2}
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={updateStoreInfo.isPending}
        data-ocid="storeinfo.save_button"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {updateStoreInfo.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Save Changes
      </Button>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="admin.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </button>
          <span className="font-serif text-sm font-medium text-foreground">
            Admin Panel
          </span>
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => clear()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="admin.logout_button"
            >
              Log out
            </button>
          )}
          {!isLoggedIn && <div className="w-16" />}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Not logged in */}
        {!isLoggedIn && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Admin Access
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in with Internet Identity to manage the store.
              </p>
            </div>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="admin.login.button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLoggingIn ? "Signing in…" : "Sign In"}
            </Button>
          </div>
        )}

        {/* Logged in, checking admin */}
        {isLoggedIn && adminLoading && (
          <div
            className="flex flex-col items-center justify-center py-24 gap-4"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying access…</p>
          </div>
        )}

        {/* Not admin */}
        {isLoggedIn && !adminLoading && !isAdmin && (
          <div
            className="flex flex-col items-center justify-center py-24 gap-6"
            data-ocid="admin.error_state"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                Not Authorized
              </h2>
              <p className="text-muted-foreground text-sm">
                Your account does not have admin privileges.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {identity?.getPrincipal().toString()}
              </p>
            </div>
          </div>
        )}

        {/* Admin dashboard */}
        {isLoggedIn && !adminLoading && isAdmin && (
          <div data-ocid="admin.panel">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-foreground">
                  A Lookover Fashion — Admin
                </h1>
                <p className="text-xs text-muted-foreground">
                  {identity?.getPrincipal().toString().slice(0, 24)}…
                </p>
              </div>
            </div>

            <Tabs defaultValue="products">
              <TabsList className="mb-6" data-ocid="admin.tab">
                <TabsTrigger value="products" className="gap-2">
                  <Package className="w-4 h-4" /> Products
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2">
                  <Tag className="w-4 h-4" /> Categories
                </TabsTrigger>
                <TabsTrigger value="store" className="gap-2">
                  <Store className="w-4 h-4" /> Store Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductsTab />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoriesTab />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="store">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      Store Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StoreInfoTab />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
