# A Lookover Fashion - Image Upload Admin Panel

## Current State
- Static wholesale fashion website with hardcoded categories and products in backend
- Products and categories have imageUrl fields but point to placeholder/generated images
- No way for the store owner to upload real product photos
- Authorization and blob-storage components are now selected

## Requested Changes (Diff)

### Add
- Admin login via Internet Identity (authorization component)
- Admin panel page accessible via /admin route or a hidden link
- Ability to upload product images and category images using blob-storage
- Backend functions: addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, updateStoreInfo
- Admin can manage the full catalog: add/edit/delete products and categories
- Products and categories stored in stable var (not const) so they can be updated
- Uploaded images stored via blob-storage and URLs saved to products/categories

### Modify
- Backend: convert categories/products from const arrays to stable mutable storage (Map)
- Backend: add admin-only write functions
- Frontend: show uploaded images in collection/product grid when available
- Frontend: add Admin button (subtle, in footer or nav) that opens admin panel

### Remove
- Nothing removed from public-facing UI

## Implementation Plan
1. Generate updated backend with stable storage for products/categories and admin CRUD functions
2. Wire authorization + blob-storage mixins into main.mo
3. Frontend: add AdminPanel component with login, image upload, product/category management
4. Frontend: wire StorageClient for blob uploads, save returned URL to product/category
5. Frontend: add subtle admin access link in footer
