import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: bigint;
    moq: bigint;
    categoryId: bigint;
    name: string;
    imageUrl: string;
    rating: number;
    priceUSD: number;
}
export interface CategoryUpdate {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
}
export interface Category {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
}
export interface ProductUpdate {
    id: bigint;
    moq: bigint;
    categoryId: bigint;
    name: string;
    imageUrl: string;
    rating: number;
    priceUSD: number;
}
export interface StoreInfo {
    businessHours: string;
    city: string;
    email: string;
    address: string;
    phone: string;
}
export interface Inquiry {
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface SubmittedInquiry {
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(category: CategoryUpdate): Promise<void>;
    addProduct(product: ProductUpdate): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllInquiries(): Promise<Array<SubmittedInquiry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getInquiry(id: bigint): Promise<Inquiry>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(categoryId: bigint): Promise<Array<Product>>;
    getStoreInfo(): Promise<StoreInfo>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(term: string, minPrice: number, maxPrice: number, minRating: number): Promise<Array<Product>>;
    submitInquiry(name: string, email: string, message: string): Promise<bigint>;
    updateCategory(category: CategoryUpdate): Promise<void>;
    updateProduct(product: ProductUpdate): Promise<void>;
    updateStoreInfo(info: StoreInfo): Promise<void>;
    uploadImage(name: string, blob: ExternalBlob): Promise<void>;
}
