import { prisma } from "./prisma";
import { DEFAULT_SETTINGS } from "./default-settings";

export type StoreSettings = typeof DEFAULT_SETTINGS;
export { DEFAULT_SETTINGS };

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const merged: StoreSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    for (const row of rows) {
      try {
        const val = JSON.parse(row.valueJson);
        if (row.key in merged) {
          // @ts-expect-error dynamic key merge
          merged[row.key] = val;
        }
      } catch {
        // ignore malformed setting
      }
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSetting<K extends keyof StoreSettings>(
  key: K,
  value: StoreSettings[K]
): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { valueJson: JSON.stringify(value) },
    create: { key, valueJson: JSON.stringify(value) },
  });
}
