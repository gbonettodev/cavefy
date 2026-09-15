const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001/api").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, options = {}, token = "") {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  const abortRequest = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("json") ? await response.json() : null;

    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("cavefy:unauthorized"));
    }
    if (!response.ok) {
      throw new ApiError(
        body?.mensagem || "Não foi possível concluir a operação.",
        response.status,
        body,
      );
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError" && !options.signal?.aborted) {
      throw new ApiError("A API demorou demais para responder.", 408);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Não foi possível conectar à API. Verifique se o backend está ligado.",
      0,
    );
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortRequest);
  }
}

export { BASE_URL };
