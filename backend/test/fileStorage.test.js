import assert from "node:assert/strict";
import { test } from "node:test";
import { fileReference } from "../src/services/fileStorage.js";

test("fileReference cria caminhos relativos e portáveis", () => {
  assert.equal(
    fileReference({ fieldname: "audio", filename: "faixa.mp3" }),
    "/uploads/audios/faixa.mp3",
  );
  assert.equal(
    fileReference({ fieldname: "capa", filename: "capa.webp" }),
    "/uploads/capas/capa.webp",
  );
  assert.equal(fileReference(null), null);
});
