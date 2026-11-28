import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit, requireAdmin, verifySameOrigin } from "@/lib/auth";
import { PRODUCT_CATEGORIES, slugify } from "@/lib/constants";

const VALID_CATS = new Set<string>(PRODUCT_CATEGORIES.map((c) => c.value));

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { csvText, dryRun } = (await request.json()) as { csvText: string; dryRun?: boolean };
    const lines = String(csvText || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must include a header row and at least one product row." }, { status: 400 });
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const rows = lines.slice(1).map((line, idx) => {
      const vals = parseCsvLine(line);
      const record: Record<string, string> = {};
      headers.forEach((h, i) => {
        record[h] = vals[i] || "";
      });

      const errors: string[] = [];
      if (!record.name) errors.push("Missing name");
      if (!record.sku) errors.push("Missing sku");
      if (!VALID_CATS.has(record.category)) errors.push(`Invalid category (${record.category})`);
      const priceLkr = Number(record.pricelkr || record.price);
      const costLkr = Number(record.costlkr || record.cost);
      if (!priceLkr || priceLkr <= 0) errors.push("Invalid priceLkr");
      if (isNaN(costLkr) || costLkr < 0) errors.push("Invalid costLkr");

      return {
        rowNumber: idx + 2,
        valid: errors.length === 0,
        errors,
        data: {
          sku: record.sku,
          name: record.name,
          category: record.category || "RAYON_HANDLOOM",
          badge: record.category === "IMPORTED" ? "IMPORTED" : "HANDLOOM",
          fabric: record.fabric || "Handloom",
          weave: record.weave || "Handloom weave",
          origin: record.origin || (record.category === "IMPORTED" ? "Imported" : "Sri Lanka"),
          priceLkr: Math.round(priceLkr || 0),
          costLkr: Math.round(costLkr || 0),
          stock: Math.max(0, Math.round(Number(record.stock) || 0)),
          colours: JSON.stringify((record.colours || "").split("|").filter(Boolean)),
          occasions: JSON.stringify((record.occasions || "").split("|").filter(Boolean)),
          shortDesc: record.shortdesc || "Curated Luxe Loomie saree.",
          longDesc: record.longdesc || record.shortdesc || "Curated Luxe Loomie saree.",
          care: record.care || "Gentle cold hand wash or dry clean.",
        },
      };
    });

    if (dryRun) {
      return NextResponse.json({ preview: rows });
    }

    let importedCount = 0;
    for (const r of rows) {
      if (!r.valid) continue;
      const slug = `${slugify(r.data.name)}-${r.data.sku.toLowerCase()}`;
      await prisma.product.upsert({
        where: { sku: r.data.sku },
        update: { ...r.data },
        create: { ...r.data, slug, status: "DRAFT" },
      });
      importedCount += 1;
    }

    await logAudit({
      userId: session.userId,
      action: "PRODUCT_CSV_IMPORT",
      entityType: "Product",
      details: { importedCount },
    });

    return NextResponse.json({ importedCount });
  } catch {
    return NextResponse.json({ error: "CSV import failed" }, { status: 400 });
  }
}
