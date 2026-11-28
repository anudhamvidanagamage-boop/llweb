export const DEFAULT_SETTINGS = {
  storeName: "Luxe Loomie",
  tagline: "Sri Lankan handloom elegance, curated with care.",
  whatsappNumber: "0775465623",
  phoneDisplay: "077 546 5623",
  email: "hello@luxeloomie.lk",
  address: "71, Kurunegakataa Road, Divulapitiya, Sri Lanka",
  openingHours: "Daily, 9:00 AM – 7:00 PM",
  deliveryFeeLkr: 0,
  freeDeliveryThresholdLkr: 0,
  codEnabled: true,
  cardLinkEnabled: true,
  cardLinkNote: "We will send a secure bank payment link via WhatsApp once your order is confirmed.",
  bankDetails: {
    bankName: "[PLACEHOLDER: Bank Name]",
    branch: "[PLACEHOLDER: Branch]",
    accountName: "[PLACEHOLDER: Account Holder Name]",
    accountNumber: "[PLACEHOLDER: Account Number]",
  },
  bundleRule: {
    enabled: true,
    minQty: 2,
    discountPerSareeLkr: 500,
    label: "Two-Saree Bundle: Save LKR 500 per saree when you order 2 or more.",
  },
  loyaltyRule: {
    enabled: true,
    sareesForReward: 5,
    rewardDescription: "Collect a stamp on every saree. Enjoy a special thank-you privilege on your 5th Luxe Loomie saree.",
  },
  lowStockThreshold: 3,
  floorMarginPercent: 30,
  homepageBanner: {
    eyebrow: "SRI LANKAN HANDLOOM & CURATED IMPORTS",
    headline: "Sri Lankan handloom elegance, curated with care.",
    subheadline:
      "Every saree is individually inspected for weave, colour fastness, finish, and measurement. Delivered island-wide.",
    ctaLabel: "Shop Sarees",
    ctaHref: "/shop",
  },
  seasonalBanner: {
    enabled: true,
    title: "Island-Wide Free Delivery",
    subtitle: "Complimentary courier delivery across Sri Lanka. Personal styling advice on WhatsApp.",
    ctaLabel: "Explore Collection",
    ctaHref: "/shop",
  },
  faqs: [
    {
      question: "How long is each Luxe Loomie saree?",
      answer:
        "Each saree measures approximately 5.5 metres in body length and includes an unstitched blouse piece, unless noted otherwise on the product page.",
    },
    {
      question: "How do you check quality before shipping?",
      answer:
        "Every saree is inspected at receipt and before dispatch for weave consistency, colour fastness (rub test), snags, stains, border and pallu finish, and length.",
    },
    {
      question: "What is the difference between Handloom and Imported sarees?",
      answer:
        "Our core collection is woven by vetted Sri Lankan handloom producers and cooperatives. Our smaller Imported range is clearly labelled 'Imported' and curated for special occasions.",
    },
    {
      question: "How do I order via WhatsApp?",
      answer:
        "Click 'Order on WhatsApp' on any saree page to open a pre-filled message with the saree name, SKU, and link. Our team replies during business hours (9 AM – 7 PM).",
    },
    {
      question: "What is your return and exchange policy?",
      answer:
        "We offer exchanges within 7 days of delivery if the saree is unworn, unwashed, and has all original tags intact. Full refunds are provided for verified manufacturing defects.",
    },
  ],
  policies: {
    delivery:
      "We deliver island-wide across Sri Lanka through trusted courier partners. Orders are dispatched within 24 to 48 hours of confirmation. Island-wide delivery is currently complimentary.",
    returns:
      "Exchanges are accepted within 7 days of delivery provided the saree is unworn, unwashed, unaltered, and carries its original tags. In the rare event of a defect, please contact us on WhatsApp within 48 hours of receipt for a full refund or replacement.",
    privacy:
      "We collect only the contact and delivery details needed to fulfil your order and provide WhatsApp support if you opt in. We never sell or share customer data with third parties.",
    terms:
      "All prices are listed in Sri Lankan Rupees (LKR) and are VAT-exclusive unless stated otherwise. Colours may vary slightly depending on screen calibration, though all photos are taken in natural light to show true colour.",
  },
  analytics: {
    ga4Id: "",
    metaPixelId: "",
  },
};
