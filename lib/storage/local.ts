/**
 * Local disk storage for MVP. Swap for S3-compatible later without changing callers.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? path.join(process.cwd(), "storage");

export async function saveAssetBuffer(
  storageKey: string,
  data: Buffer,
): Promise<{ storageKey: string; absolutePath: string }> {
  const absolutePath = path.join(STORAGE_ROOT, storageKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, data);
  return { storageKey, absolutePath };
}

export function resolveAssetPath(storageKey: string): string {
  return path.join(STORAGE_ROOT, storageKey);
}

export async function readAssetBuffer(storageKey: string): Promise<Buffer> {
  return readFile(resolveAssetPath(storageKey));
}
