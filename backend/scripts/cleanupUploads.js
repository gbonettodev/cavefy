import fs from "node:fs/promises";
import path from "node:path";
import pool from "../src/database/connection.js";
import { uploadsDirectory } from "../src/services/fileStorage.js";

function relativeUploadPath(value) {
  try {
    const pathname = new URL(value, "http://cavefy.local").pathname;
    if (!pathname.startsWith("/uploads/")) return null;
    return decodeURIComponent(pathname.slice("/uploads/".length)).replaceAll("\\", "/");
  } catch {
    return null;
  }
}

async function filesIn(directory) {
  try {
    const names = await fs.readdir(path.join(uploadsDirectory, directory));
    return names.map((name) => `${directory}/${name}`);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function main() {
  const { rows } = await pool.query(`
    SELECT capa_url AS url FROM musicas WHERE capa_url IS NOT NULL
    UNION ALL
    SELECT audio_url AS url FROM musicas WHERE audio_url IS NOT NULL
    UNION ALL
    SELECT foto_url AS url FROM usuarios WHERE foto_url IS NOT NULL
    UNION ALL
    SELECT capa_url AS url FROM playlists WHERE capa_url IS NOT NULL
  `);
  const references = new Set(
    rows.map(({ url }) => relativeUploadPath(url)).filter(Boolean),
  );
  const files = [...(await filesIn("capas")), ...(await filesIn("audios"))];
  const orphans = files.filter((file) => !references.has(file));
  const shouldDelete = process.argv.includes("--delete");

  console.log(
    `${orphans.length} arquivo(s) órfão(s) entre ${files.length} arquivo(s).`,
  );
  orphans.forEach((file) => console.log(`- ${file}`));

  if (shouldDelete) {
    await Promise.all(
      orphans.map((file) => fs.unlink(path.join(uploadsDirectory, file))),
    );
    console.log("Arquivos órfãos removidos.");
  } else if (orphans.length) {
    console.log("Use --delete para remover somente os arquivos listados.");
  }
}

try {
  await main();
} finally {
  await pool.end();
}
