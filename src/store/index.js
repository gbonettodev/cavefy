import { create } from 'zustand';

const savedUser = localStorage.getItem('cavefy_user');
const savedToken = localStorage.getItem('cavefy_token');
const initialUser = savedUser ? JSON.parse(savedUser) : null;

function playCountsKey(user) { return `cavefy_play_counts_${user?.id || 'anonymous'}`; }
function getPlayCounts(user) {
  try { return JSON.parse(localStorage.getItem(playCountsKey(user))) || {}; } catch { return {}; }
}

export const useCavefyStore = create((set, get) => ({
  usuario: initialUser,
  token: savedToken || '',
  reproducoes: getPlayCounts(initialUser),
  musicaAtual: null,
  fila: [],
  entrar: (usuario, token = 'demo-token') => { localStorage.setItem('cavefy_user', JSON.stringify(usuario)); localStorage.setItem('cavefy_token', token); set({ usuario, token, reproducoes: getPlayCounts(usuario) }); },
  sair: () => { localStorage.removeItem('cavefy_user'); localStorage.removeItem('cavefy_token'); set({ usuario: null, token: '', reproducoes: {}, musicaAtual: null, fila: [] }); },
  tocar: (musica, fila = []) => {
    const usuario = get().usuario;
    if (!musica?.audio_url || !usuario) return set({ musicaAtual: musica, fila });
    const key = playCountsKey(usuario);
    const reproducoes = { ...get().reproducoes, [musica.id]: (get().reproducoes[musica.id] || 0) + 1 };
    localStorage.setItem(key, JSON.stringify(reproducoes));
    set({ musicaAtual: musica, fila, reproducoes });
  },
}));
