import Time "mo:core/Time";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let categories = Map.empty<Nat, Category>();
  let products = Map.empty<Nat, Product>();
  let images = Map.empty<Text, Storage.ExternalBlob>();
  let inquiries = Map.empty<Nat, Inquiry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var storeInfo : StoreInfo = {
    address = "123 Fashion Ave";
    city = "Mumbai";
    phone = "555-123-4567";
    email = "info@lookoverfashion.com";
    businessHours = "Mon-Sat 10am-6pm";
  };

  var inquiryId = 1;
  var productId = 9;
  var categoryId = 5;

  public type UserProfile = {
    name : Text;
  };

  type ProductUpdate = {
    id : Nat;
    name : Text;
    categoryId : Nat;
    priceUSD : Float;
    moq : Nat;
    rating : Float;
    imageUrl : Text;
  };

  type Product = {
    id : Nat;
    name : Text;
    categoryId : Nat;
    priceUSD : Float;
    moq : Nat;
    rating : Float;
    imageUrl : Text;
  };

  type StoreInfo = {
    address : Text;
    city : Text;
    phone : Text;
    email : Text;
    businessHours : Text;
  };

  type CategoryUpdate = {
    id : Nat;
    name : Text;
    description : Text;
    imageUrl : Text;
  };

  type Category = {
    id : Nat;
    name : Text;
    description : Text;
    imageUrl : Text;
  };

  type Inquiry = {
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  type SubmittedInquiry = {
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  module Inquiry {
    public func compare(inquiry1 : SubmittedInquiry, inquiry2 : SubmittedInquiry) : Order.Order {
      Int.compare(inquiry2.timestamp, inquiry1.timestamp);
    };
  };

  let defaultCategories = [
    {
      id = 1;
      name = "Women's Apparel";
      description = "Trendy clothing for women.";
      imageUrl = "https://lookoverfashion.com/women.jpg";
    },
    {
      id = 2;
      name = "Men's Apparel";
      description = "Stylish clothing for men.";
      imageUrl = "https://lookoverfashion.com/men.jpg";
    },
    {
      id = 3;
      name = "Kids' Collection";
      description = "Fashionable clothing for kids.";
      imageUrl = "https://lookoverfashion.com/kids.jpg";
    },
    {
      id = 4;
      name = "Accessories";
      description = "Wide range of accessories.";
      imageUrl = "https://lookoverfashion.com/accessories.jpg";
    },
  ];

  let defaultProducts = [
    {
      id = 1;
      name = "Women's Summer Dress";
      categoryId = 1;
      priceUSD = 25.99;
      moq = 10;
      rating = 4.5;
      imageUrl = "https://lookoverfashion.com/dress.jpg";
    },
    {
      id = 2;
      name = "Men's T-Shirt";
      categoryId = 2;
      priceUSD = 15.99;
      moq = 12;
      rating = 4.3;
      imageUrl = "https://lookoverfashion.com/shirt.jpg";
    },
    {
      id = 3;
      name = "Kids' Jacket";
      categoryId = 3;
      priceUSD = 30.99;
      moq = 8;
      rating = 4.7;
      imageUrl = "https://lookoverfashion.com/jacket.jpg";
    },
    {
      id = 4;
      name = "Sunglasses";
      categoryId = 4;
      priceUSD = 12.99;
      moq = 15;
      rating = 4.2;
      imageUrl = "https://lookoverfashion.com/sunglasses.jpg";
    },
    {
      id = 5;
      name = "Men's Jeans";
      categoryId = 2;
      priceUSD = 35.99;
      moq = 10;
      rating = 4.4;
      imageUrl = "https://lookoverfashion.com/jeans.jpg";
    },
    {
      id = 6;
      name = "Women's Blouse";
      categoryId = 1;
      priceUSD = 22.99;
      moq = 12;
      rating = 4.6;
      imageUrl = "https://lookoverfashion.com/blouse.jpg";
    },
    {
      id = 7;
      name = "Kids' Shorts";
      categoryId = 3;
      priceUSD = 18.49;
      moq = 15;
      rating = 4.1;
      imageUrl = "https://lookoverfashion.com/shorts.jpg";
    },
    {
      id = 8;
      name = "Belts";
      categoryId = 4;
      priceUSD = 9.99;
      moq = 20;
      rating = 3.9;
      imageUrl = "https://lookoverfashion.com/belts.jpg";
    },
  ];

  // User profile functions (required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Inquiry functions - admin-only access to view inquiries
  public query ({ caller }) func getAllInquiries() : async [SubmittedInquiry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all inquiries");
    };
    inquiries.values().toArray().map(func(inquiry) { { inquiry with timestamp = inquiry.timestamp } });
  };

  public query ({ caller }) func getInquiry(id : Nat) : async Inquiry {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view inquiries");
    };
    switch (inquiries.get(id)) {
      case (null) { Runtime.trap("Inquiry not found") };
      case (?inquiry) { inquiry };
    };
  };

  // Public query functions - no authorization needed
  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(categoryId : Nat) : async [Product] {
    products.values().toArray().filter(func(product) { product.categoryId == categoryId });
  };

  public query ({ caller }) func getStoreInfo() : async StoreInfo {
    storeInfo;
  };

  public query ({ caller }) func searchProducts(term : Text, minPrice : Float, maxPrice : Float, minRating : Float) : async [Product] {
    products.values().toArray().filter(func(product) { product.name.toLower().contains(#text(term.toLower())) }).filter(func(product) { product.priceUSD >= minPrice and product.priceUSD <= maxPrice and product.rating >= minRating });
  };

  // Public function - anyone can submit an inquiry
  public shared ({ caller }) func submitInquiry(name : Text, email : Text, message : Text) : async Nat {
    let id = inquiryId;
    let inquiry : Inquiry = {
      name;
      email;
      message;
      timestamp = Time.now();
    };
    inquiries.add(id, inquiry);

    inquiryId += 1;
    id;
  };

  // Admin-only functions
  public shared ({ caller }) func addCategory(category : CategoryUpdate) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    categories.add(categoryId, { category with id = categoryId });
    categoryId += 1;
  };

  public shared ({ caller }) func addProduct(product : ProductUpdate) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(productId, { product with id = productId });
    let id = productId;
    productId += 1;

    id;
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found ") };
      case (_) { categories.remove(id) };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found ") };
      case (_) { products.remove(id) };
    };
  };

  public shared ({ caller }) func updateCategory(category : CategoryUpdate) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(category.id)) {
      case (null) { Runtime.trap("Category not found ") };
      case (_) { categories.add(category.id, category) };
    };
  };

  public shared ({ caller }) func updateProduct(product : ProductUpdate) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(product.id)) {
      case (null) { Runtime.trap("Product not found ") };
      case (_) { products.add(product.id, product) };
    };
  };

  public shared ({ caller }) func updateStoreInfo(info : StoreInfo) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update store information");
    };
    storeInfo := info;
  };

  public shared ({ caller }) func uploadImage(name : Text, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can upload images");
    };
    images.add(name, blob);
  };
};
