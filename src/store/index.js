import { create } from "zustand";

const savedUser = localStorage.getItem("cavefy_user");
const savedToken = localStorage.getItem("cavefy_token");

function readSavedUser() {
  if (!savedUser || !savedToken) return null;
  try {
    const user = JSON.parse(savedUser);
    return user && typeof user === "object" && user.id ? user : null;
  } catch {
    localStorage.removeItem("cavefy_user");
    localStorage.removeItem("cavefy_token");
    return null;
  }
}

const initialUser = readSavedUser();

export const useCavefyStore = create((set, get) => ({
  usuario: initialUser,
  token: initialUser ? savedToken : "",
  musicaAtual: null,
  fila: [],
  entrar: (usuario, token) => {
    localStorage.setItem("cavefy_user", JSON.stringify(usuario));
    localStorage.setItem("cavefy_token", token);
    set({ usuario, token });
  },
  sair: () => {
    localStorage.removeItem("cavefy_user");
    localStorage.removeItem("cavefy_token");
    set({
      usuario: null,
      token: "",
      musicaAtual: null,
      fila: [],
    });
  },
  tocar: (musica, fila = []) => {
    if (!musica?.audio_url || !get().usuario) return false;
    set({ musicaAtual: musica, fila });
    return true;
  },
  parar: () => set({ musicaAtual: null, fila: [] }),
}));

window.addEventListener("cavefy:unauthorized", () => {
  useCavefyStore.getState().sair();
});
