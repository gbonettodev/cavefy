import { Play } from 'lucide-react';
import Cover from './Cover';
export default function SongCard({ song, onPlay, onOpen }) { return <article className="song-card" onClick={() => onOpen?.(song)}><div className="card-cover-wrap"><Cover song={song} /><button className="card-play" onClick={(event) => { event.stopPropagation(); onPlay(song); }}><Play size={19} fill="currentColor" /></button></div><strong>{song.titulo}</strong><span>{song.artista}</span><small>{song.genero || 'Seleção CAVEFY'}</small></article>; }
