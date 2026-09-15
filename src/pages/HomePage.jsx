import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowRight, Music2, Play, Plus, Sparkles } from "lucide-react";
import { useCavefyStore } from "../store/index";
import { mediaUrl, primeiroNome } from "../services/media";
import SongCard from "../components/SongCard";
import SongRow from "../components/SongRow";
export default function HomePage() {
  const { musicas, tocar, carregando } = useOutletContext();
  const usuario = useCavefyStore((state) => state.usuario);
  const navigate = useNavigate();
  const first = musicas.find((song) => song.audio_url);
  const nome = primeiroNome(usuario?.nome);
  const faixas = carregando ? [] : musicas;
  const topSong = [...faixas]
    .filter((song) => song.audio_url && Number(song.reproducoes || 0) > 0)
    .sort((a, b) => Number(b.reproducoes || 0) - Number(a.reproducoes || 0))[0];
  const topPlays = Number(topSong?.reproducoes || 0);
  return (
    <>
      <section
        className="hero-banner"
        style={{
          backgroundImage: "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "none",
          borderRadius: 0,
        }}
      >
        <div className="hero-glow" />
        <div className="hero-copy">
          <span className="eyebrow">Sua estação sonora</span>
          <h1>
            Bem-vindo, <em>{nome}.</em>
          </h1>
          <p>Descubra novas camadas para o seu dia.</p>
          <button
            className="button button-gold"
            type="button"
            disabled={!first}
            onClick={() => first && tocar(first, musicas)}
          >
            Começar a ouvir <Play size={16} fill="currentColor" />
          </button>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Feito para você</span>
          <h2>Seu universo em rotação</h2>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => navigate("/musicas")}
        >
          Ver tudo <ArrowRight size={15} />
        </button>
      </div>
      {faixas.length ? (
        <section className="song-grid">
          {faixas.slice(0, 5).map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={(item) => tocar(item, musicas)}
              onOpen={() => navigate(`/musicas/${song.id}`)}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state home-empty">
          <Music2 size={34} />
          <h3>Sua biblioteca ainda está vazia</h3>
          <p>Adicione sua primeira música para começar a criar o universo CAVEFY.</p>
          <button
            className="button button-gold"
            type="button"
            onClick={() => navigate("/musicas/novo")}
          >
            <Plus size={16} /> Adicionar primeira música
          </button>
        </section>
      )}
      <section className="home-columns">
        <div className="panel-dark">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Catálogo recente</span>
              <h2>Adicionado nas cavernas</h2>
            </div>
            <Music2 size={21} />
          </div>
          {faixas.slice(0, 4).map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index + 1}
              onPlay={() => tocar(song, musicas)}
              onOpen={() => navigate(`/musicas/${song.id}`)}
            />
          ))}
          {!faixas.length && (
            <p className="panel-empty">
              As músicas adicionadas por você aparecerão aqui.
            </p>
          )}
        </div>
        <div
          className="quote-card top-listened-card"
          style={
            topSong?.capa_url
              ? {
                  backgroundImage: `url(${mediaUrl(topSong.capa_url)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          <div className="top-listened-icon">
            <Sparkles size={21} />
          </div>
          <span className="eyebrow">Top 1 · mais escutada</span>
          {topSong ? (
            <>
              <p>{topSong.titulo}</p>
              <span>
                {topSong.artista} · {topPlays}{" "}
                {topPlays === 1 ? "reprodução" : "reproduções"}
              </span>
            </>
          ) : (
            <>
              <p>Comece a ouvir suas músicas.</p>
              <span>Seu Top 1 aparecerá aqui</span>
            </>
          )}
        </div>
      </section>
    </>
  );
}
