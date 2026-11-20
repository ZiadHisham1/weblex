// puck.config.tsx
import type { Config } from "@puckeditor/core";
import type { SiteType } from "@prisma/client";

import { Pricing } from "@/components/blocks/Pricing";
import { LuxuryHero } from "./components/blocks/LuxuryHero";
import { SynthHero } from "./components/blocks/hero-2";
import { ShopByCategory } from "./components/blocks/ShopByCategory";
import {
  ProductList,
  type ResolvedProduct,
} from "./components/blocks/ProductList";
import { TrendingGrid } from "./components/blocks/TrendingGrid";
import WelcomeBar1 from "./components/blocks/WelcomeBars/welcomeBar-1";
import WelcomeBar2 from "./components/blocks/WelcomeBars/welcomeBar-2";
import { ProductGridWithFilter } from "./components/blocks/ProductGrid/wide-clear";
import { ProductPicker } from "./components/puck/ProductPicker";
import { MediaUploadField } from "./components/puck/MediaUploadField";
import { GlassyNavbar } from "./components/blocks/GlassyNavbar";
import { VideoHero } from "./components/blocks/Heroes/VideoHero";
import { ShopByCategoryRow } from "./components/blocks/ShopByCategoryRow";
import { BestSellers } from "./components/blocks/BestSellers";
import { FeaturedProducts } from "./components/blocks/FeaturedProducts";
import { CollectionsList } from "./components/blocks/CollectionsList";
import { FaqAccordion } from "./components/blocks/FaqAccordion";
import { Footer } from "./components/blocks/Footer";

// ==========================================
// TYPES
// ==========================================

export type TenantProductOption = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
};

export type GlobalFilters = {
  sizes: string[];
  colors: string[];
  tags: string[];
};

export type BuildConfigCtx = {
  tenantId: string;
  siteType: SiteType;
  siteSubdomain: string;
  /** Options shown in the editor's "pick product" dropdown. */
  productOptions: TenantProductOption[];
  /** Full data used at render time, keyed by product id. */
  productDetails: Record<string, ResolvedProduct>;
  /** Global options fetched directly from Medusa */
  globalFilters: GlobalFilters;
};

/** Legacy callers (before the product-select migration) pass `products`. */
type LegacyCtx = {
  tenantId?: string;
  siteType?: SiteType;
  siteSubdomain?: string;
  products?: TenantProductOption[];
  productOptions?: TenantProductOption[];
  productDetails?: Record<string, ResolvedProduct>;
  globalFilters?: GlobalFilters;
};

// ==========================================
// UTILS & SHARED COMPONENTS
// ==========================================

const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-12 cursor-pointer rounded border p-1"
      />
      <span className="text-sm font-mono text-gray-500">
        {value || "#000000"}
      </span>
    </div>
  );
};

// ==========================================
// HERO VARIANTS
// ==========================================

const HeroCentered = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="py-24 px-4 text-center bg-gray-50">
    <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
      {title}
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

const HeroSplit = ({
  title,
  subtitle,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  imageUrl: string;
}) => (
  <div className="py-20 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div>
      <h1 className="text-5xl font-extrabold mb-4 text-gray-900">{title}</h1>
      <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
      <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold">
        Get Started
      </button>
    </div>
    <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt="Hero" className="w-full h-full object-cover" />
      ) : (
        "Image Placeholder"
      )}
    </div>
  </div>
);

const HeroDark = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="py-24 px-4 text-center bg-gray-900 text-white">
    <h1 className="text-5xl font-bold mb-4">{title}</h1>
    <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

// ==========================================
// FACTORY
// ==========================================

export function buildConfig(ctxOrLegacy: BuildConfigCtx | LegacyCtx): Config {
  // ---------------------------------------------------------------------
  // Normalize the context so both shapes work.
  // ---------------------------------------------------------------------
  const raw = ctxOrLegacy as LegacyCtx;

  const productOptions: TenantProductOption[] =
    raw.productOptions ??
    raw.products ??
    [];

  const productDetails: Record<string, ResolvedProduct> =
    raw.productDetails ??
    Object.fromEntries(
      productOptions.map((p) => [
        p.id,
        {
          id: p.id,
          title: p.title,
          handle: p.handle ?? "",
          thumbnail: p.thumbnail ?? null,
          variantId: null,
          priceStr: "—",
          priceAmount: 0,
          options: [],
          tags: [],
        } satisfies ResolvedProduct,
      ]),
    );

  // Default global filters if none passed
  const globalFilters: GlobalFilters = raw.globalFilters ?? {
    sizes: [],
    colors: [],
    tags: [],
  };

  const siteSubdomain: string = raw.siteSubdomain ?? "";
  const tenantId: string = raw.tenantId ?? "";
  const siteType: SiteType = raw.siteType ?? ("COMMERCE" as SiteType);

  // Puck's `select` field expects `{ label, value }[]`.
  const options: { label: string; value: string }[] = productOptions.map(
    (p) => ({ label: p.title, value: p.id }),
  );

  return {
    categories: {
      welcome: {
        title: "Welcome Sections",
        components: ["WelcomeBar1", "WelcomeBar2"],
      },
      heroes: {
        title: "Hero Sections",
        components: [
          "HeroCentered",
          "HeroSplit",
          "HeroDark",
          "LuxuryHero",
          "SynthHero",
        ],
      },
      pricing: {
        title: "Pricing Sections",
        components: ["PricingBlock"],
      },
      commerce: {
        title: "E-Commerce Sections",
        components: ["ShopByCategory", "ProductList", "TrendingGrid", "ProductGridWithFilter"],
      },
    },

    components: {
      // ---------------------------------------------------------------
      // 1. Centered Hero
      // ---------------------------------------------------------------
      HeroCentered: {
        label: "Centered Hero",
        fields: {
          title: { type: "text" },
          subtitle: { type: "textarea" },
        },
        defaultProps: {
          title: "Welcome to my site",
          subtitle: "This is the centered hero variant.",
        },
        render: ({ title, subtitle }) => (
          <HeroCentered title={title} subtitle={subtitle} />
        ),
      },

      // ---------------------------------------------------------------
      // 2. Split Hero (Image)
      // ---------------------------------------------------------------
      HeroSplit: {
        label: "Split Hero (Image)",
        fields: {
          title: { type: "text" },
          subtitle: { type: "textarea" },
          imageUrl: { type: "text" },
        },
        defaultProps: {
          title: "Build faster with our tool",
          subtitle:
            "The best platform for modern teams to ship products quickly.",
          imageUrl:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
        },
        render: ({ title, subtitle, imageUrl }) => (
          <HeroSplit title={title} subtitle={subtitle} imageUrl={imageUrl} />
        ),
      },

      // ---------------------------------------------------------------
      // 3. Dark Hero
      // ---------------------------------------------------------------
      HeroDark: {
        label: "Dark Hero",
        fields: {
          title: { type: "text" },
          subtitle: { type: "textarea" },
        },
        defaultProps: {
          title: "Welcome to the dark side",
          subtitle: "A sleek, dark hero section for premium brands.",
        },
        render: ({ title, subtitle }) => (
          <HeroDark title={title} subtitle={subtitle} />
        ),
      },

      // ---------------------------------------------------------------
      // 4. Pricing Table
      // ---------------------------------------------------------------
      PricingBlock: {
        label: "Pricing Table",
        fields: {
          title: { type: "text" },
          price: { type: "text" },
          features: {
            type: "array",
            getItemSummary: (item) => item.feature || "Feature",
            arrayFields: {
              feature: { type: "text" },
            },
          },
          bgColor: {
            type: "custom",
            render: ({ value, onChange }) => (
              <ColorPicker value={value} onChange={onChange} />
            ),
          },
        },
        defaultProps: {
          title: "Pro Plan",
          price: "$29/mo",
          features: [
            { feature: "Unlimited projects" },
            { feature: "24/7 Support" },
          ],
          bgColor: "#f3f4f6",
        },
        render: ({ title, price, features, bgColor }) => {
          const featureStrings = (features as { feature: string }[]).map(
            (f) => f.feature,
          );
          return (
            <Pricing
              title={title}
              price={price}
              features={featureStrings}
              bgColor={bgColor}
            />
          );
        },
      },

      // ---------------------------------------------------------------
      // 5. Quiet Luxury Hero
      // ---------------------------------------------------------------
      LuxuryHero: {
        label: "Quiet Luxury Hero (Background)",
        fields: {
          subtitle: { type: "text" },
          title: { type: "textarea" },
          description: { type: "textarea" },
          buttonText: { type: "text" },
          buttonUrl: { type: "text" },
          backgroundImage: {
            type: 'custom',
            label: 'Background Image/Video',
            render: ({ value, onChange }) => (
              <MediaUploadField 
                value={value as string} 
                onChange={onChange} 
                label="Background Media"
              />
            ),
          },
        },
        defaultProps: {
          subtitle: "Best Collection",
          title:
            'Quiet luxury,<br/><span class="text-[#c4b5a0]">loudly considered.</span>', // Adjusted color slightly for better visibility
          description:
            "Explore premium clothing and statement accessories curated for every season, every style, and every occasion.",
          buttonText: "Explore Shop",
          buttonUrl: "#",
          backgroundImage:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
        },
        render: ({
          subtitle,
          title,
          description,
          buttonText,
          buttonUrl,
          backgroundImage,
        }) => (
          <LuxuryHero
            subtitle={subtitle}
            title={title}
            description={description}
            buttonText={buttonText}
            buttonUrl={buttonUrl}
            backgroundImage={backgroundImage}
          />
        ),
      },

    GlassyNavbar: {
      fields: {
        logoText: {
          type: 'text',
          label: 'Logo Main Text',
        },
        logoAccent: {
          type: 'text',
          label: 'Logo Accent Text (e.g. .IO)',
        },
        links: {
          type: 'array',
          label: 'Navigation Links',
          getItemSummary: (item) => item.label || 'Link',
          arrayFields: {
            label: { type: 'text', label: 'Label' },
            url: { type: 'text', label: 'URL' },
          },
          defaultItemProps: {
            label: 'New Link',
            url: '#',
          },
        },
        textColor: {
          type: 'radio',
          options: [
            { label: 'Dark Text', value: 'dark' },
            { label: 'Light Text', value: 'light' },
          ],
          label: 'Text Color',
        },
        showGlobe: {
          type: 'radio',
          options: [
            { label: 'Show', value: true },
            { label: 'Hide', value: false },
          ],
          label: 'Show Globe Icon',
        },
        showUser: {
          type: 'radio',
          options: [
            { label: 'Show', value: true },
            { label: 'Hide', value: false },
          ],
          label: 'Show User Icon',
        },
        showCart: {
          type: 'radio',
          options: [
            { label: 'Show', value: true },
            { label: 'Hide', value: false },
          ],
          label: 'Show Cart Icon',
        },
        cartCount: {
          type: 'number',
          label: 'Cart Badge Count',
          min: 0,
        },
      },
      defaultProps: {
        logoText: 'HOME',
        logoAccent: '.IO',
        links: [
          { label: 'home', url: '/' },
          { label: 'collection', url: '/collection' },
          { label: 'category', url: '/category' },
          { label: 'about', url: '/about' },
          { label: 'contact', url: '/contact' },
        ],
        textColor: 'dark',
        showGlobe: true,
        showUser: true,
        showCart: true,
        cartCount: 0,
      },
      render: (props) => <GlassyNavbar {...props} />,
    },

  
      // ---------------------------------------------------------------
      // Video Hero (Now with Media Upload)
      // ---------------------------------------------------------------
      VideoHero: {
        label: "Video Hero",
        fields: {
          videoUrl: {
            type: 'custom',
            label: 'Background Video (MP4)',
            render: ({ value, onChange }) => (
              <MediaUploadField 
                value={value as string} 
                onChange={onChange} 
                label="Upload Video"
              />
            ),
          },
          posterUrl: {
            type: 'custom',
            label: 'Video Poster Image (Fallback)',
            render: ({ value, onChange }) => (
              <MediaUploadField 
                value={value as string} 
                onChange={onChange} 
                label="Upload Image"
              />
            ),
          },
          title: {
            type: 'textarea',
            label: 'Heading Title (Press Enter for line breaks)',
          },
          primaryButtonText: {
            type: 'text',
            label: 'Primary Button Text',
          },
          primaryButtonLink: {
            type: 'text',
            label: 'Primary Button Link',
          },
          secondaryButtonText: {
            type: 'text',
            label: 'Secondary Button Text',
          },
          secondaryButtonLink: {
            type: 'text',
            label: 'Secondary Button Link',
          },
        },
        defaultProps: {
          videoUrl: 'https://videos.pexels.com/video-files/31617692/13470975_1920_1080_24fps.mp4',
          posterUrl: '',
          title: 'EXPLORE HOW THE CREATIVES\nDESIGN THERE INTERNAL\nVERSES',
          primaryButtonText: 'explore',
          primaryButtonLink: '/explore',
          secondaryButtonText: 'shop by category',
          secondaryButtonLink: '/category',
        },
        render: (props) => <VideoHero {...props} />,
      },

      // ---------------------------------------------------------------
      // Shop by Category (Now with Media Upload)
      // ---------------------------------------------------------------
      ShopByCategoryRow: {
        label: "Shop by Category Row",
        fields: {
          categories: {
            type: 'array',
            label: 'Category Items',
            getItemSummary: (item) => item.name || 'New Category',
            arrayFields: {
              name: { type: 'text', label: 'Category Name' },
              imageUrl: { 
                type: 'custom', 
                label: 'Category Image',
                render: ({ value, onChange }) => (
                  <MediaUploadField 
                    value={value as string} 
                    onChange={onChange} 
                    label="Upload Image"
                  />
                ),
              },
              link: { type: 'text', label: 'Link URL' },
            },
            defaultItemProps: {
              name: 'New Category',
              imageUrl: '',
              link: '#',
            },
          },
        },
        defaultProps: {
          categories: [
            // ... your default categories ...
          ],
        },
        render: (props) => <ShopByCategoryRow {...props} />,
      },

      BestSellers: {
      label: "Best Sellers Grid",
      fields: {
        title: { type: "text", label: "Section Title" },
        headerLink: { type: "text", label: "Header Arrow Link" },
        items: {
          type: "array",
          label: "Best Sellers (First item is the large image)",
          getItemSummary: (item, index) => 
            item.discountTag ? `Item ${index + 1} (${item.discountTag})` : `Item ${index + 1}`,
          arrayFields: {
            imageUrl: { 
              type: 'custom', 
              label: 'Product Image',
              render: ({ value, onChange }) => (
                <MediaUploadField 
                  value={value as string} 
                  onChange={onChange} 
                  label="Upload Image"
                />
              ),
            },
            discountTag: { type: "text", label: "Discount Badge (e.g., 50% OFF)" },
            link: { type: "text", label: "Product Link" },
          },
          defaultItemProps: {
            imageUrl: '',
            discountTag: '',
            link: '#',
          },
        },
      },
      defaultProps: {
        title: "BEST SELLERS",
        headerLink: "/shop",
        items: [
          {
            imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
            discountTag: "50% OFF",
            link: "/product/luxury-sofa",
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop",
            discountTag: "30% OFF",
            link: "/product/luxury-bed",
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop",
            discountTag: "25% OFF",
            link: "/product/dining-set",
          },
        ],


      },
      render: (props) => <BestSellers {...props} />,
    },


     FeaturedProducts: {
      label: "Featured Products Grid",
      fields: {
        title: { type: "text", label: "Section Title" },
        headerLink: { type: "text", label: "Header Arrow Link" },
        items: {
          type: "array",
          label: "Featured Images",
          getItemSummary: (item, index) => `Image ${index + 1}`,
          arrayFields: {
            imageUrl: { 
              type: 'custom', 
              label: 'Product Image',
              render: ({ value, onChange }) => (
                <MediaUploadField 
                  value={value as string} 
                  onChange={onChange} 
                  label="Upload Image"
                />
              ),
            },
            link: { type: "text", label: "Product Link" },
          },
          defaultItemProps: {
            imageUrl: '',
            link: '#',
          },
        },
      },
      defaultProps: {
        title: "Featured Products",
        headerLink: "/shop",
        items: [
          {
            imageUrl: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1000&auto=format&fit=crop",
            link: "/product/dining-set",
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1000&auto=format&fit=crop",
            link: "/product/bedroom-set",
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1000&auto=format&fit=crop",
            link: "/product/bed-frame",
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop",
            link: "/product/dining-table",
          },
        ],
      },
      render: (props) => <FeaturedProducts {...props} />,
    },


    CollectionsList: {
      label: "Collections List",
      fields: {
        sectionTitle: { type: "text", label: "Section Title" },
        headerLink: { type: "text", label: "Header Arrow Link" },
        items: {
          type: "array",
          label: "Collections",
          getItemSummary: (item, index) => item.title || `Collection ${index + 1}`,
          arrayFields: {
            title: { type: "text", label: "Collection Name (e.g., CLASSIC)" },
            imageUrl: { 
              type: 'custom', 
              label: 'Background Image',
              render: ({ value, onChange }) => (
                <MediaUploadField 
                  value={value as string} 
                  onChange={onChange} 
                  label="Upload Image"
                />
              ),
            },
            link: { type: "text", label: "Link URL" },
          },
          defaultItemProps: {
            title: 'NEW COLLECTION',
            imageUrl: '',
            link: '#',
          },
        },
      },
      defaultProps: {
        sectionTitle: "Collections",
        headerLink: "/collections",
        items: [
          {
            title: "CLASSIC",
            imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1600&auto=format&fit=crop",
            link: "/collections/classic",
          },
          {
            title: "SIMPLE",
            imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop",
            link: "/collections/simple",
          },
          {
            title: "WOODEN",
            imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1600&auto=format&fit=crop",
            link: "/collections/wooden",
          },
          {
            title: "MODERN",
            imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop",
            link: "/collections/modern",
          },
        ],
      },
      render: (props) => <CollectionsList {...props} />,
    },

    FaqAccordion: {
      label: "FAQ Accordion",
      fields: {
        allowMultipleOpen: {
          type: "radio",
          options: [
            { label: "Open one at a time", value: false },
            { label: "Allow multiple open", value: true },
          ],
          label: "Behavior",
        },
        items: {
          type: "array",
          label: "Questions & Answers",
          getItemSummary: (item, index) => item.question || `Question ${index + 1}`,
          arrayFields: {
            question: { type: "text", label: "Question" },
            answer: { type: "textarea", label: "Answer" },
          },
          defaultItemProps: {
            question: "How long does shipping take?",
            answer: "Shipping usually takes from 2-3 working days.",
          },
        },
      },
      defaultProps: {
        allowMultipleOpen: false,
        items: [
          {
            question: "How long the shipping takes ?",
            answer: "shipping usually takes from 2-3 days of working days",
          },
          {
            question: "What is your return policy?",
            answer: "We accept returns within 30 days of purchase for a full refund.",
          },
          {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to most countries worldwide. Shipping costs will apply.",
          },
          {
            question: "How can I track my order?",
            answer: "Once your order ships, you will receive an email with a tracking number and link.",
          },
        ],
      },
      render: (props) => <FaqAccordion {...props} />,
    },

    Footer: {
      label: "Footer",
      fields: {
        productLinks: {
          type: "array",
          label: "Product Links",
          getItemSummary: (item, i) => item.label || `Link ${i + 1}`,
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" },
          },
          defaultItemProps: { label: "New Link", url: "#" },
        },
        exploreLinks: {
          type: "array",
          label: "Explore Links",
          getItemSummary: (item, i) => item.label || `Link ${i + 1}`,
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" },
          },
          defaultItemProps: { label: "New Link", url: "#" },
        },
        companyLinks: {
          type: "array",
          label: "Company Links",
          getItemSummary: (item, i) => item.label || `Link ${i + 1}`,
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" },
          },
          defaultItemProps: { label: "New Link", url: "#" },
        },
        subscribeTitle: { type: "text", label: "Subscribe Title" },
        subscribeDescription: { type: "textarea", label: "Subscribe Description" },
        subscribeButtonText: { type: "text", label: "Subscribe Button Label" },
        legalLinks: {
          type: "array",
          label: "Legal Links (Bottom)",
          getItemSummary: (item, i) => item.label || `Link ${i + 1}`,
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" },
          },
          defaultItemProps: { label: "New Link", url: "#" },
        },
        socialLinks: {
          type: "object",
          label: "Social Links",
          objectFields: {
            linkedin: { type: "text", label: "LinkedIn URL" },
            facebook: { type: "text", label: "Facebook URL" },
            twitter: { type: "text", label: "Twitter / X URL" },
          },
        },
      },
      defaultProps: {
        productLinks: [
          { label: "Living Room", url: "/collections/living" },
          { label: "Bedroom", url: "/collections/bedroom" },
          { label: "Dining Room", url: "/collections/dining" },
          { label: "Office", url: "/collections/office" },
          { label: "Outdoor", url: "/collections/outdoor" },
        ],
        exploreLinks: [
          { label: "New Arrivals", url: "/new" },
          { label: "Best Sellers", url: "/best-sellers" },
          { label: "Lookbook", url: "/lookbook" },
          { label: "Gift Cards", url: "/gift-cards" },
        ],
        companyLinks: [
          { label: "About Us", url: "/about" },
          { label: "Craftsmanship", url: "/craftsmanship" },
          { label: "Sustainability", url: "/sustainability" },
          { label: "Contact", url: "/contact" },
        ],
        subscribeTitle: "Subscribe",
        subscribeDescription: "Join our newsletter to receive exclusive offers, design inspiration, and early access to new collections.",
        subscribeButtonText: "Subscribe",
        legalLinks: [
          { label: "Terms of Service", url: "/terms" },
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Cookies", url: "/cookies" },
        ],
        socialLinks: {
          linkedin: "https://linkedin.com",
          facebook: "https://facebook.com",
          twitter: "https://twitter.com",
        },
      },
      render: (props) => <Footer {...props} />,
    },    

      // ---------------------------------------------------------------
      // 6. Synth Streetwear Hero
      // ---------------------------------------------------------------
      SynthHero: {
        label: "Synth Streetwear Hero",
        fields: {
          logoText: { type: "text" },
          buttonText: { type: "text" },
          bgText: { type: "text" },
          accentText1: { type: "text" },
          accentText2: { type: "text" },
          subtitle: { type: "text" },
          bottomLeftTitle: { type: "text" },
          bottomLeftText: { type: "textarea" },
          floatingTitle: { type: "text" },
          floatingText: { type: "textarea" },
          bgImage: { type: "text" },
          navLinks: {
            type: "array",
            getItemSummary: (item) => item.label || "Link",
            arrayFields: {
              label: { type: "text" },
              url: { type: "text" },
            },
          },
        },
        defaultProps: {
          logoText: "SYNTH ERA",
          buttonText: "Preorder",
          bgText: "SYNTH ERA",
          accentText1: "MODERN",
          accentText2: "ARMOR",
          subtitle: "CREATED FOR YOU.",
          bottomLeftTitle: "LIMITED PRE-ORDERS",
          bottomLeftText:
            "Own the next-generation jacket engineered for your comfort and bold individuality.",
          floatingTitle: "THIS MONTH'S EXCLUSIVE",
          floatingText:
            "Pre-order now and unlock exclusive pricing this month.",
          bgImage:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop",
          navLinks: [
            { label: "Collection", url: "#" },
            { label: "Concept", url: "#" },
            { label: "Editorials", url: "#" },
            { label: "Lookbook", url: "#" },
          ],
        },
        render: ({
          logoText,
          navLinks,
          buttonText,
          bgText,
          accentText1,
          accentText2,
          subtitle,
          bottomLeftTitle,
          bottomLeftText,
          floatingTitle,
          floatingText,
          bgImage,
        }) => (
          <SynthHero
            logoText={logoText}
            navLinks={navLinks}
            buttonText={buttonText}
            bgText={bgText}
            accentText1={accentText1}
            accentText2={accentText2}
            subtitle={subtitle}
            bottomLeftTitle={bottomLeftTitle}
            bottomLeftText={bottomLeftText}
            floatingTitle={floatingTitle}
            floatingText={floatingText}
            bgImage={bgImage}
          />
        ),
      },

      // ---------------------------------------------------------------
      // 7. Shop by Category
      // ---------------------------------------------------------------
      ShopByCategory: {
        label: "Shop by Category",
        fields: {
          title: { type: "text" },
          categories: {
            type: "array",
            getItemSummary: (item) => item.name || "Category",
            arrayFields: {
              name: { type: "text" },
              imageUrl: { type: "text" },
            },
          },
        },
        defaultProps: {
          title: "Shop by Category",
          categories: [
            {
              name: "Sneakers",
              imageUrl: "https://pngimg.com/d/running_shoes_PNG5816.png",
            },
            {
              name: "Apparel",
              imageUrl: "https://pngimg.com/d/tshirt_PNG5432.png",
            },
            {
              name: "Collectibles",
              imageUrl: "https://pngimg.com/d/lego_PNG24.png",
            },
            {
              name: "Accessories",
              imageUrl: "https://pngimg.com/d/handbag_PNG100709.png",
            },
            {
              name: "Watches",
              imageUrl: "https://pngimg.com/d/watch_PNG16575.png",
            },
            {
              name: "Trading Cards",
              imageUrl: "https://pngimg.com/d/magic_card_PNG32.png",
            },
          ],
        },
        render: ({ title, categories }) => (
          <ShopByCategory title={title} categories={categories} />
        ),
      },

      // ---------------------------------------------------------------
      // 8. Product List — Medusa-driven, select-based
      // ---------------------------------------------------------------
      ProductList: {
        label: "Product List (Medusa)",
        fields: {
          title: { type: "text", label: "Section title" },
          columns: {
            type: "select",
            label: "Columns",
            options: [
              { label: "2 columns", value: "2" },
              { label: "3 columns", value: "3" },
              { label: "4 columns", value: "4" },
            ],
          },
          products: {
            type: "array",
            label: "Products",
            getItemSummary: (item: any) =>
              item?.productId?.label || "Select a product",
            arrayFields: {
              productId: {
                type: "select",
                label: "Product",
                options: [
                  { label: "— pick a product —", value: "" },
                  ...options,
                ],
              },
            },
            defaultItemProps: {
              productId: { label: "", value: "" },
            },
          },
        },
        defaultProps: {
          title: "Featured Products",
          columns: "4",
          products: [],
        },
        render: ({ title, columns, products }) => {
          // Puck stores `select` values inconsistently across versions. Normalize
          // every shape we've seen into a simple `string[]` of product IDs.
          const raw = (products ?? []) as unknown[];
          const ids: string[] = [];

          for (const item of raw) {
            if (!item) continue;

            // item can be { productId: X } or X directly
            const candidate = (item as any).productId ?? item;

            // X can be: string | {value: string} | {label, value} | Array of those
            const push = (v: any) => {
              if (typeof v === "string" && v) ids.push(v);
              else if (v && typeof v === "object" && typeof v.value === "string") {
                if (v.value) ids.push(v.value);
              }
            };

            if (Array.isArray(candidate)) candidate.forEach(push);
            else push(candidate);
          }

          return (
            <ProductList
              title={title}
              columns={columns as string}
              productIds={ids}
              productDetails={productDetails}
              siteSubdomain={siteSubdomain}
            />
          );
        },
      },

      // ---------------------------------------------------------------
      // 9. Trending Editorial Grid
      // ---------------------------------------------------------------
      TrendingGrid: {
        label: "Trending Editorial Grid",
        fields: {
          title: { type: "text" },
          items: {
            type: "array",
            getItemSummary: (item, index = 0) =>
              item.tag || `Image ${index + 1}`,
            arrayFields: {
              imageUrl: { type: "text" },
              tag: { type: "text" },
              link: { type: "text" },
            },
          },
        },
        defaultProps: {
          title: "Trending Now",
          items: [
            {
              imageUrl:
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
              link: "/shop/mens/coats",
            },
            {
              imageUrl:
                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
              link: "/shop/mens/suits",
            },
            {
              imageUrl:
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80",
              tag: "ELEVATED OUTERWEAR",
              link: "/shop/mens/outerwear",
            },
          ],
        },
        render: ({ title, items }) => (
          <TrendingGrid title={title} items={items} />
        ),
      },

      // ---------------------------------------------------------------
      // 10. Product Grid With Filter
      // ---------------------------------------------------------------
      ProductGridWithFilter: {
        label: "Product Grid With Filter",
        fields: {
          title: { type: "text", label: "Section Title" },
          heroImage: { type: "text", label: "Hero Image URL" },
          
          // 👇 NEW: The Master Filter Configuration
          masterFilter: {
            type: "object",
            label: "Filter Configuration",
            objectFields: {
              sizes: { type: "array", arrayFields: { value: { type: "text" } } },
              colors: { type: "array", arrayFields: { value: { type: "text" } } },
              properties: { type: "array", arrayFields: { value: { type: "text" } } },
            },
          },
        },
        defaultProps: {
          title: "Shop All",
          heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop",
          // Default mock data
          masterFilter: {
            sizes: [{ value: "XS" }, { value: "S" }, { value: "M" }, { value: "L" }, { value: "XL" }],
            colors: [{ value: "Black" }, { value: "White" }, { value: "Red" }, { value: "Blue" }],
            properties: [{ value: "Waterproof" }, { value: "Lightweight" }],
          },
        },
        render: ({ puck, ...props }) => (
          <ProductGridWithFilter
            {...props}
            productDetails={productDetails}
            siteSubdomain={siteSubdomain}
          />
        ),
      },

      // ---------------------------------------------------------------
      // 11. Welcome Bar 1
      // ---------------------------------------------------------------
      WelcomeBar1: {
        label: "Welcome Bar 1",
        fields: {
          welcome_txt: { type: "text" },
          bgColor: {
            type: "custom",
            render: ({ value, onChange }) => (
              <ColorPicker value={value} onChange={onChange} />
            ),
          },
          txtColor: {
            type: "custom",
            render: ({ value, onChange }) => (
              <ColorPicker value={value} onChange={onChange} />
            ),
          },
        },
        defaultProps: {
          welcome_txt: "Welcome to our site! Enjoy your stay.",
          bgColor: "#f3f4f6",
          txtColor: "#000000",
        },
        render: ({ welcome_txt, bgColor, txtColor }) => (
          <WelcomeBar1
            bgColor={bgColor}
            text_color={txtColor}
            welcome_txt={welcome_txt}
          />
        ),
      },

      // ---------------------------------------------------------------
      // 12. Welcome Bar 2 (Framer Motion)
      // ---------------------------------------------------------------
      WelcomeBar2: {
        label: "Animated Welcome Bar (Framer)",
        fields: {
          bgColor: { type: "text" },
          text_color: { type: "text" },
          texts: {
            type: "array",
            getItemSummary: (item, i = 0) => item.text || `Message ${i + 1}`,
            arrayFields: {
              text: { type: "text" },
            },
          },
        },
        defaultProps: {
          bgColor: "#1a1a1a",
          text_color: "#ffffff",
          texts: [
            { text: "🚚 Free shipping on orders over $50!" },
            { text: "✨ Use code WELCOME10 for 10% off your first order." },
          ],
        },
        render: ({ bgColor, text_color, texts }) => {
          const stringTexts = ((texts || []) as Array<{ text?: string }>)
            .map((t) => t?.text)
            .filter((t): t is string => typeof t === "string" && t !== "");

          return (
            <WelcomeBar2
              bgColor={bgColor}
              text_color={text_color}
              texts={stringTexts}
            />
          );
        },
      },
    },
  };
}

// ==========================================
// BACKWARD-COMPAT EXPORT
// ==========================================
// Anything that still does `import config from "@/puck.config"` keeps
// building. This config has NO products, so `<Render>`-ing it will show
// an empty ProductList — but nothing crashes at build time.
export const config: Config = buildConfig({
  tenantId: "",
  siteType: "COMMERCE" as SiteType,
  siteSubdomain: "",
  productOptions: [],
  productDetails: {},
  globalFilters: { sizes: [], colors: [], tags: [] },
});

export default config;