import { Music2 } from "lucide-react";
import { coverStyle, mediaUrl } from "../services/media";
export default function Cover({ song, size = "" }) {
  return (
    <div
      className={`cover cover-${song.cor || "gold"} ${size}`}
      style={coverStyle(song)}
    >
      {song.capa_url ? (
        <img
          className="cover-image"
          src={mediaUrl(song.capa_url)}
          alt={`Capa de ${song.titulo}`}
        />
      ) : (
        <>
          <Music2 size={size === "small" ? 20 : 30} />
          <span>{song.titulo?.slice(0, 1)}</span>
        </>
      )}
    </div>
  );
}
