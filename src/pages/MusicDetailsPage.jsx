import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ArrowLeft, Disc3, Edit3, ListPlus, Music2, Play, Trash2 } from "lucide-react";
import { duration } from "../services/media";
import { useCavefyStore } from "../store/index";
import Cover from "../components/Cover";
import PlaylistPicker from "../components/PlaylistPicker";
export default function MusicDetailsPage() {
  const { id } = useParams();
  const { musicas, playlists, tocar, excluirMusica, recarregarPlaylists, carregando } =
    useOutletContext();
  const navigate = useNavigate();
  const usuario = useCavefyStore((state) => state.usuario);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const song = musicas.find((item) => String(item.id) === id);

  if (carregando)
    return (
      <div className="empty-state" role="status">
        <Disc3 className="spin" size={30} />
        <p>Carregando música...</p>
      </div>
    );

  if (!song)
    return (
      <div className="empty-state">
        <Music2 size={30} />
        <h3>Música não encontrada</h3>
        <button
          className="text-button"
          type="button"
          onClick={() => navigate("/musicas")}
        >
          Voltar ao catálogo
        </button>
      </div>
    );
  const podeEditar =
    usuario?.papel === "administrador" ||
    Number(song.criado_por) === Number(usuario?.id);

  return (
    <div className="details-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}>
        <ArrowLeft size={17} /> Voltar ao catálogo
      </button>
      <section className="detail-hero">
        <Cover song={song} />
        <div className="detail-copy">
          <span className="eyebrow">
            {song.genero || "Faixa do catálogo"} · {song.ano || "2026"}
          </span>
          <h1>{song.titulo}</h1>
          <p className="detail-artist">{song.artista}</p>
          <p className="detail-description">
            {song.descricao || "Uma faixa catalogada no universo CAVEFY."}
          </p>
          <div className="detail-actions">
            <button
              className="button button-gold"
              type="button"
              onClick={() => tocar(song, musicas)}
            >
              {song.audio_url ? (
                <Play size={17} fill="currentColor" />
              ) : (
                <Disc3 size={17} />
              )}{" "}
              {song.audio_url ? "Ouvir agora" : "Ouvir quando disponível"}
            </button>
            <button
              className="icon-button-dark"
              type="button"
              aria-label="Adicionar à playlist"
              onClick={() => setShowPlaylistPicker(true)}
            >
              <ListPlus size={18} />
            </button>
            {podeEditar && (
              <button
                className="icon-button-dark"
                type="button"
                aria-label="Editar música"
                onClick={() => navigate(`/musicas/${song.id}/editar`)}
              >
                <Edit3 size={17} />
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="detail-meta">
        <div>
          <span>Álbum</span>
          <strong>{song.album || "Single"}</strong>
        </div>
        <div>
          <span>Duração</span>
          <strong>{duration(song.duracao_segundos)}</strong>
        </div>
        <div>
          <span>Disponibilidade</span>
          <strong>{song.audio_url ? "Áudio disponível" : "Somente catálogo"}</strong>
        </div>
        <div>
          <span>Código</span>
          <strong>#{String(song.id).padStart(4, "0")}</strong>
        </div>
      </div>
      {podeEditar && (
        <button
          className="danger-link"
          type="button"
          onClick={async () => {
            const excluida = await excluirMusica(song.id);
            if (excluida) navigate("/musicas");
          }}
        >
          <Trash2 size={15} /> Excluir esta música
        </button>
      )}
      {showPlaylistPicker && (
        <PlaylistPicker
          song={song}
          playlists={playlists}
          reload={recarregarPlaylists}
          onClose={() => setShowPlaylistPicker(false)}
        />
      )}
    </div>
  );
}
