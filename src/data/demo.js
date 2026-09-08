export const demoUser = { id: 'demo', nome: 'Og', email: 'og@cavefy.app', papel: 'usuario' };
export const demoGenres = ['Rock', 'Pop', 'Eletrônica', 'Hip Hop', 'MPB', 'Jazz', 'Clássica', 'Lo-fi'].map((nome, index) => ({ id: index + 1, nome }));
export const demoSongsKey = 'cavefy_demo_songs';
export const demoPlaylistsKey = 'cavefy_demo_playlists';

export function getDemoSongs() {
  try {
    const saved = JSON.parse(localStorage.getItem(demoSongsKey));
    return Array.isArray(saved) ? saved.filter((song) => song.criado_por) : [];
  } catch {
    return [];
  }
}

export function getDemoPlaylists() {
  try {
    return JSON.parse(localStorage.getItem(demoPlaylistsKey)) || [];
  } catch {
    return [];
  }
}
