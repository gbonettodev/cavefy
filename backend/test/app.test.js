import assert from "node:assert/strict";
import { after, test } from "node:test";
import { once } from "node:events";
import app from "../src/app.js";
import pool from "../src/database/connection.js";

async function withServer(run) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

after(async () => {
  await pool.end();
});

test("GET /health responde sem expor o Express", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.deepEqual(body, { status: "ok", app: "CAVEFY API" });
  });
});

test("rotas inexistentes retornam JSON 404", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/nao-existe`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.match(body.mensagem, /Rota não encontrada/);
  });
});

test("CORS rejeita origens não autorizadas", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { Origin: "https://origem-invalida.example" },
    });

    assert.equal(response.status, 403);
  });
});
