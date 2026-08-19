import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Where owner-uploaded product photos go.
 *
 * Locally they are written to public/uploads. On a serverless host the
 * filesystem is wiped on every deploy, so when BLOB_READ_WRITE_TOKEN is present
 * the same photos go to Vercel Blob instead and the returned URL is absolute.
 * Callers never need to know which one is in use.
 */
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export const usingBlobStore = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function safeName(original: string) {
  const ext = original.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
}

export async function saveImage(file: File): Promise<string> {
  const name = safeName(file.name);

  if (usingBlobStore()) {
    // Imported lazily so local development does not need the package installed.
    const { put } = await import('@vercel/blob');
    const blob = await put(`products/${name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function saveImages(files: File[]): Promise<string[]> {
  const usable = files.filter((file) => file instanceof File && file.size > 0);
  return Promise.all(usable.map(saveImage));
}
