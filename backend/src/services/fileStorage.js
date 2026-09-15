import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = path.resolve(currentDirectory, "../../uploads");

function uploadedFilesFromRequest(req) {
  const grouped = req.files ? Object.values(req.files).flat() : [];
  return [...grouped, ...(req.file ? [req.file] : [])];
}

function resolveStoredPath(value) {
  if (!value) return null;

  try {
    const pathname = new URL(value, "http://cavefy.local").pathname;
    const normalized = decodeURIComponent(pathname).replaceAll("\\", "/");
    if (!normalized.startsWith("/uploads/")) return null;

    const relativePath = normalized.slice("/uploads/".length);
    const absolutePath = path.resolve(uploadsDirectory, relativePath);
    const allowedPrefix = `${uploadsDirectory}${path.sep}`;

    return absolutePath.startsWith(allowedPrefix) ? absolutePath : null;
  } catch {
    return null;
  }
}

async function removePath(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Não foi possível remover o arquivo ${filePath}:`, error);
    }
  }
}

export function fileReference(file) {
  if (!file) return null;
  const directory = file.fieldname === "audio" ? "audios" : "capas";
  return `/uploads/${directory}/${file.filename}`;
}

export async function removeStoredFile(value) {
  await removePath(resolveStoredPath(value));
}

export async function removeUploadedFiles(req) {
  await Promise.all(uploadedFilesFromRequest(req).map((file) => removePath(file.path)));
}
