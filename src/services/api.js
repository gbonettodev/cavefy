const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function apiFetch(path, options = {}, token = "") {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("json") ? await response.json() : null;
  if (!response.ok)
    throw new Error(body?.mensagem || "Não foi possível concluir a operação.");
  return body;
}

export { BASE_URL };
