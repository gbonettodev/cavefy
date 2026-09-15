import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptsDirectory, "..");
const distDirectory = path.resolve(projectDirectory, "dist");

if (
  path.dirname(distDirectory) !== projectDirectory ||
  path.basename(distDirectory) !== "dist"
) {
  throw new Error("Diretório de build inválido. Limpeza cancelada.");
}

await fs.rm(distDirectory, { recursive: true, force: true });
await fs.mkdir(distDirectory, { recursive: true });
console.log(`Build anterior removido de ${distDirectory}`);
