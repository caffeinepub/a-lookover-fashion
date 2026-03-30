import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";

module {
  type Category = {
    id : Nat;
    name : Text;
    description : Text;
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

  type Inquiry = {
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    categories : [Category];
    products : [Product];
    storeInfo : StoreInfo;
    inquiries : Map.Map<Int, Inquiry>;
    inquiryCount : Nat;
  };

  type NewActor = {
    images : Map.Map<Text, Storage.ExternalBlob>;
    categories : Map.Map<Nat, Category>;
    products : Map.Map<Nat, Product>;
    storeInfo : StoreInfo;
    inquiries : Map.Map<Nat, Inquiry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inquiryId : Nat;
    productId : Nat;
    categoryId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newCategories = Map.empty<Nat, Category>();
    for (category in old.categories.values()) {
      newCategories.add(category.id, category);
    };

    let newProducts = Map.empty<Nat, Product>();
    for (product in old.products.values()) {
      newProducts.add(product.id, product);
    };

    let newInquiries = Map.empty<Nat, Inquiry>();
    for (timestamp in old.inquiries.keys()) {
      switch (old.inquiries.get(timestamp)) {
        case (null) {};
        case (?inquiry) { newInquiries.add(Int.abs(timestamp), inquiry) };
      };
    };

    {
      images = Map.empty<Text, Storage.ExternalBlob>();
      categories = newCategories;
      products = newProducts;
      storeInfo = old.storeInfo;
      inquiries = newInquiries;
      userProfiles = Map.empty<Principal, UserProfile>();
      inquiryId = old.inquiryCount;
      productId = old.products.size();
      categoryId = old.categories.size();
    };
  };
};
