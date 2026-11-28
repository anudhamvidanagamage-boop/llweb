import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// @ts-expect-error Node --experimental-strip-types requires .ts, build excludes this file
import { DEFAULT_SETTINGS } from "../src/lib/default-settings.ts"; // eslint-disable-line

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Luxe Loomie database...");

  // 1. Seed Admin Users (Owner & Staff)
  const ownerHash = bcrypt.hashSync("LuxeLoomie2026!", 12);
  const staffHash = bcrypt.hashSync("StaffLoomie2026!", 12);

  await prisma.user.upsert({
    where: { email: "owner@luxeloomie.lk" },
    update: {},
    create: {
      email: "owner@luxeloomie.lk",
      name: "Store Owner",
      passwordHash: ownerHash,
      role: "OWNER",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@luxeloomie.lk" },
    update: {},
    create: {
      email: "staff@luxeloomie.lk",
      name: "Store Staff",
      passwordHash: staffHash,
      role: "STAFF",
    },
  });

  // 2. Seed Settings
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: {
        key,
        valueJson: JSON.stringify(value),
      },
    });
  }

  // 3. Seed Products from uploaded images + indicative business-plan ladder
  const products = [
    {
      sku: "LL-FC-001",
      slug: "charcoal-magenta-striped-handloom-saree",
      name: "Charcoal & Magenta Striped Handloom Saree",
      category: "FULL_COTTON",
      badge: "HANDLOOM",
      fabric: "Full Cotton [PLACEHOLDER: confirm exact yarn]",
      weave: "Handloom plain weave with contrast stripe",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["Charcoal Grey", "Magenta"]),
      occasions: JSON.stringify(["Office", "Everyday"]),
      shortDesc:
        "Breathable charcoal grey handloom cotton accented with crisp magenta stripes. Tailored for long workdays in Sri Lanka's climate.",
      longDesc:
        "Woven in Sri Lanka with a breathable cotton body and clean magenta linear stripes. Checked at receipt for weave consistency, colour fastness, and finish. Ideal for office wear and everyday elegance.",
      care: "Gentle hand wash separately in cold water with mild detergent. Dry in shade. Warm iron on reverse.",
      priceLkr: 7500,
      compareAtLkr: null,
      costLkr: 4500,
      stock: 6,
      lowStockThreshold: 3,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: true,
      seoTitle: "Charcoal & Magenta Striped Handloom Saree | Luxe Loomie Sri Lanka",
      seoDesc:
        "Shop breathable Sri Lankan Full Cotton handloom saree in charcoal grey with magenta stripes. Island-wide delivery.",
      imageUrl: "/uploads/products/charcoal-magenta-cotton.jpg",
      imageAlt: "Charcoal grey Sri Lankan handloom cotton saree with magenta stripes",
    },
    {
      sku: "LL-FC-002",
      slug: "midnight-black-ochre-striped-handloom-saree",
      name: "Midnight Black & Ochre Striped Handloom Saree",
      category: "FULL_COTTON",
      badge: "HANDLOOM",
      fabric: "Full Cotton [PLACEHOLDER: confirm exact yarn]",
      weave: "Handloom plain weave with contrast stripe",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["Black", "Mustard Ochre"]),
      occasions: JSON.stringify(["Office", "Everyday", "Festive"]),
      shortDesc:
        "Deep black handloom cotton framed by warm mustard-ochre stripes. Structured drape that moves effortlessly from desk to evening.",
      longDesc:
        "A timeless black handloom saree lifted by understated ochre-gold stripes. Individually inspected for weave evenness, border finish, and measurement accuracy.",
      care: "Gentle hand wash separately in cold water. Do not wring. Dry in shade and warm iron.",
      priceLkr: 7500,
      compareAtLkr: null,
      costLkr: 4500,
      stock: 5,
      lowStockThreshold: 3,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: true,
      seoTitle: "Midnight Black & Ochre Striped Handloom Saree | Luxe Loomie",
      seoDesc:
        "Deep black Sri Lankan handloom cotton saree with mustard-ochre stripes. Quality-checked, island-wide delivery.",
      imageUrl: "/uploads/products/black-mustard-cotton.jpg",
      imageAlt: "Black Sri Lankan handloom saree with mustard ochre stripes",
    },
    {
      sku: "LL-RH-003",
      slug: "ivory-peach-border-handloom-saree",
      name: "Ivory & Peach Border Handloom Saree",
      category: "RAYON_HANDLOOM",
      badge: "HANDLOOM",
      fabric: "Rayon Handloom [PLACEHOLDER: confirm exact yarn]",
      weave: "Handloom soft drape with striped pallu",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["Ivory", "Peach"]),
      occasions: JSON.stringify(["Everyday", "Office", "Gifting"]),
      shortDesc:
        "Soft ivory drape paired with a warm peach border and hand-knotted pallu tassels. Light, fluid, and easy to wear all day.",
      longDesc:
        "Crafted for effortless all-day comfort, this ivory and peach saree combines a fluid drape with a classic striped pallu. Inspected for colour fastness and clean finishing.",
      care: "Cold hand wash with mild soap or dry clean. Dry flat in shade.",
      priceLkr: 6500,
      compareAtLkr: null,
      costLkr: 4000,
      stock: 8,
      lowStockThreshold: 3,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: true,
      seoTitle: "Ivory & Peach Border Handloom Saree | Luxe Loomie Sri Lanka",
      seoDesc:
        "Soft ivory and peach Sri Lankan Rayon Handloom saree with striped pallu. Comfortable all-day drape.",
      imageUrl: "/uploads/products/cream-peach-rayon.jpg",
      imageAlt: "Ivory cream handloom saree with peach border and striped pallu",
    },
    {
      sku: "LL-CP-004",
      slug: "pure-ivory-gold-pallu-handloom-saree",
      name: "Pure Ivory & Gold Pallu Handloom Saree",
      category: "COTTON_PUNE",
      badge: "HANDLOOM",
      fabric: "Cotton Pune [PLACEHOLDER: confirm exact yarn]",
      weave: "Pune-style structured handloom weave",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["White", "Ivory", "Gold"]),
      occasions: JSON.stringify(["Festive", "Office", "Wedding"]),
      shortDesc:
        "Crisp pure ivory handloom finished with delicate gold-toned pallu lines. Designed for Vesak, ceremonies, and formal gatherings.",
      longDesc:
        "A serene, structured ivory saree with subtle metallic-gold accent lines along the pallu and fine fringe detailing. Every piece undergoes our rub-test and measurement check before dispatch.",
      care: "Dry clean recommended, or gentle cold hand wash with mild detergent. Dry in shade.",
      priceLkr: 9500,
      compareAtLkr: null,
      costLkr: 5700,
      stock: 4,
      lowStockThreshold: 3,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: true,
      seoTitle: "Pure Ivory & Gold Pallu Handloom Saree | Luxe Loomie",
      seoDesc:
        "Pure ivory Sri Lankan Cotton Pune handloom saree with subtle gold pallu stripes for festive and formal wear.",
      imageUrl: "/uploads/products/white-gold-cotton.jpg",
      imageAlt: "Pure white ivory handloom saree with subtle gold pallu stripes",
    },
    {
      sku: "LL-RP-005",
      slug: "emerald-green-woven-pallu-handloom-saree",
      name: "Emerald Green Woven Pallu Handloom Saree",
      category: "RAYON_PUNE",
      badge: "HANDLOOM",
      fabric: "Rayon Pune [PLACEHOLDER: confirm exact yarn]",
      weave: "Pune-style handloom with iridescent woven pallu",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["Emerald Green"]),
      occasions: JSON.stringify(["Festive", "Office", "Gifting"]),
      shortDesc:
        "Rich emerald green handloom with an understated iridescent woven pallu and dark tassels. Refined colour, fluid silhouette.",
      longDesc:
        "Deep emerald green meets a subtly textured woven pallu in this Pune-style handloom saree. Chosen for its luminous drape and clean finish, suitable for celebrations and formal occasions.",
      care: "Gentle cold hand wash separately or dry clean. Dry in shade.",
      priceLkr: 8500,
      compareAtLkr: null,
      costLkr: 5100,
      stock: 5,
      lowStockThreshold: 3,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: true,
      seoTitle: "Emerald Green Woven Pallu Handloom Saree | Luxe Loomie",
      seoDesc:
        "Emerald green Sri Lankan Rayon Pune handloom saree with woven pallu. Curated quality, island-wide delivery.",
      imageUrl: "/uploads/products/emerald-woven-rayon.webp",
      imageAlt: "Emerald green Sri Lankan handloom saree with woven pallu",
    },
    {
      sku: "LL-EM-006",
      slug: "handloom-embroidered-occasion-saree-preorder",
      name: "Handloom Embroidered Occasion Saree [PLACEHOLDER]",
      category: "EMBROIDERED",
      badge: "HANDLOOM",
      fabric: "Handloom Base with Embroidery [PLACEHOLDER]",
      weave: "Handloom base with hand-finished embroidery",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["Black", "Ivory"]),
      occasions: JSON.stringify(["Wedding", "Festive", "Gifting"]),
      shortDesc:
        "Showpiece handloom saree finished with delicate embroidery for weddings and seasonal celebrations. Available for seasonal pre-order.",
      longDesc:
        "Our Embroidered range pairs a Sri Lankan handloom base with artisanal embroidery. Produced in small seasonal lots and available for pre-order ahead of Avurudu and wedding season.",
      care: "Dry clean only. Store folded in breathable cotton or tissue.",
      priceLkr: 14000,
      compareAtLkr: null,
      costLkr: 8600,
      stock: 2,
      lowStockThreshold: 2,
      status: "ACTIVE",
      isPreOrder: true,
      isNewArrival: false,
      seoTitle: "Handloom Embroidered Occasion Saree | Luxe Loomie",
      seoDesc:
        "Pre-order Sri Lankan handloom embroidered sarees for weddings and festive occasions.",
      imageUrl: null,
      imageAlt: "Photo coming soon",
    },
    {
      sku: "LL-IM-007",
      slug: "curated-imported-festive-saree-placeholder",
      name: "Curated Imported Occasion Saree [PLACEHOLDER]",
      category: "IMPORTED",
      badge: "IMPORTED",
      fabric: "Imported Curated Fabric [PLACEHOLDER]",
      weave: "Imported specialty weave [PLACEHOLDER]",
      origin: "Imported (Curated Lot)",
      length: "Approx. 5.5 m body + blouse piece",
      colours: JSON.stringify(["Charcoal", "Gold"]),
      occasions: JSON.stringify(["Wedding", "Festive"]),
      shortDesc:
        "Carefully selected imported saree in a small tested lot, inspected to the same Luxe Loomie standard as our handloom range.",
      longDesc:
        "Clearly labelled as Imported, this small-lot piece complements our Sri Lankan handloom collection with distinct texture and occasion styling.",
      care: "Dry clean recommended. Store away from direct sunlight.",
      priceLkr: 16000,
      compareAtLkr: null,
      costLkr: 9800,
      stock: 3,
      lowStockThreshold: 2,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: false,
      seoTitle: "Curated Imported Occasion Saree | Luxe Loomie Sri Lanka",
      seoDesc:
        "Small-lot curated imported sarees inspected for quality and drape. Delivered island-wide in Sri Lanka.",
      imageUrl: null,
      imageAlt: "Photo coming soon",
    },
  ];

  for (const item of products) {
    const { imageUrl, imageAlt, ...productData } = item;
    const existing = await prisma.product.findUnique({ where: { sku: item.sku } });
    if (!existing) {
      const created = await prisma.product.create({
        data: productData,
      });
      if (imageUrl) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            url: imageUrl,
            altText: imageAlt,
            sortOrder: 0,
            isCover: true,
          },
        });
      }
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
