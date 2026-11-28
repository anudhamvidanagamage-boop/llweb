import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { requireAdmin, verifySameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(dir, { recursive: true });

    const uploaded: Array<{ url: string; altText: string }> = [];

    for (const item of files) {
      if (!(item instanceof File)) continue;
      if (item.size > 12 * 1024 * 1024) continue;

      const inputBuf = Buffer.from(await item.arrayBuffer());
      const filename = `saree-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.webp`;
      const outPath = path.join(dir, filename);

      await sharp(inputBuf)
        .rotate()
        .resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(outPath);

      uploaded.push({
        url: `/uploads/products/${filename}`,
        altText: item.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      });
    }

    return NextResponse.json({ files: uploaded });
  } catch {
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }
}
