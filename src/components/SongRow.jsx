import { Play } from "lucide-react";
import { duration } from "../services/media";
import Cover from "./Cover";
export default function SongRow({ song, index, onPlay, onOpen }) {
  return (
    <div className="song-row" onClick={onOpen}>
      <span className="row-number">{String(index).padStart(2, "0")}</span>
      <Cover song={song} size="tiny" />
      <div className="row-info">
        <strong>{song.titulo}</strong>
        <span>{song.artista}</span>
      </div>
      <span className="row-genre">{song.genero || "—"}</span>
      <span className="row-duration">{duration(song.duracao_segundos)}</span>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onPlay();
        }}
      >
        <Play size={15} fill="currentColor" />
      </button>
    </div>
  );
}
