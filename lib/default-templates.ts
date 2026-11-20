// lib/default-templates.ts
export const DEFAULT_COMMERCE_PAGE = {
  content: [
    {
      type: "LuxuryHero",
      props: {
        id: "hero-1",
        subtitle: "New Collection",
        title: "Discover the <em>Essentials</em>",
        description: "Curated pieces for the modern wardrobe. Crafted with intention, designed for longevity.",
        buttonText: "Shop Now",
        buttonUrl: "#products",
        backgroundImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
      }
    },
    {
      type: "ProductList",
      props: {
        id: "products-1",
        title: "Featured Products",
        columns: "4",
        // In a real scenario, you'd fetch a few product IDs here and inject them. 
        // For now, the empty state will prompt the user to add them in the editor.
        productIds: [] 
      }
    },
    {
      type: "TrendingGrid",
      props: {
        id: "trending-1",
        title: "Trending Now",
        items: [
          { imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", tag: "The Summer Edit", link: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop", tag: "Accessories", link: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop", tag: "Footwear", link: "#" }
        ]
      }
    }
  ],
  root: {
    props: {
      title: "Home"
    }
  }
};

export const DEFAULT_BLANK_PAGE = {
  content: [],
  root: { props: {} }
};