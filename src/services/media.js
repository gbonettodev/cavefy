import { BASE_URL } from "./api";

export function mediaUrl(value) {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.pathname.startsWith("/uploads/"))
      return `${new URL(BASE_URL).origin}${parsed.pathname}`;
    return value;
  } catch {
    return value;
  }
}

export function coverStyle(song) {
  return song.capa_url ? { backgroundImage: `url(${mediaUrl(song.capa_url)})` } : {};
}
export function initials(name = "O") {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export function primeiroNome(name = "Og") {
  return name.trim().split(/\s+/)[0] || "Og";
}
export function duration(value = 0) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
