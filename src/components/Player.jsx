import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useCavefyStore } from "../store/index";
import { duration, mediaUrl } from "../services/media";
import Cover from "./Cover";
export default function Player({ musica, fila = [] }) {
  const tocar = useCavefyStore((state) => state.tocar);
  const [tocando, setTocando] = useState(Boolean(musica.audio_url));
  const [progresso, setProgresso] = useState(0);
  const [duracaoAudio, setDuracaoAudio] = useState(
    Number(musica.duracao_segundos) || 0,
  );
  const audioRef = useRef(null);
  useEffect(() => {
    const audio = audioRef.current;
    setTocando(Boolean(musica.audio_url));
    setProgresso(0);
    setDuracaoAudio(Number(musica.duracao_segundos) || 0);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.8;
      audio.src = mediaUrl(musica.audio_url);
      if (musica.audio_url) {
        audio.load();
        audio
          .play()
          .then(() => setTocando(true))
          .catch(() => setTocando(false));
      }
    }
    return () => audio?.pause();
  }, [musica]);
  function toggle() {
    if (!musica.audio_url) {
      toast.info("Esta faixa existe no catálogo, mas ainda não possui áudio.");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (tocando) {
      audio.pause();
      setTocando(false);
    } else {
      audio
        .play()
        .then(() => setTocando(true))
        .catch(() =>
          toast.error(
            "Não foi possível reproduzir este áudio. Verifique se o arquivo ainda existe na pasta backend/uploads/audios.",
          ),
        );
    }
  }
  function mudarFaixa(direcao) {
    const index = fila.findIndex(
      (item) => String(item.id) === String(musica.id),
    );
    const lista =
      direcao > 0 ? fila.slice(index + 1) : fila.slice(0, index).reverse();
    const faixa = lista.find((item) => item.criado_por && item.audio_url);
    if (faixa) tocar(faixa, fila);
  }
  function avancarOuRepetir() {
    const index = fila.findIndex(
      (item) => String(item.id) === String(musica.id),
    );
    const proxima = fila
      .slice(index + 1)
      .find((item) => item.criado_por && item.audio_url);
    if (proxima) {
      tocar(proxima, fila);
      return;
    }
    if (audioRef.current && musica.audio_url) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setProgresso(0);
      setTocando(true);
    }
  }
  function atualizarProgresso() {
    setProgresso(audioRef.current?.currentTime || 0);
  }
  function carregarDuracao() {
    if (
      audioRef.current?.duration &&
      Number.isFinite(audioRef.current.duration)
    )
      setDuracaoAudio(audioRef.current.duration);
  }
  function buscar(event) {
    const value = Number(event.target.value);
    if (audioRef.current) audioRef.current.currentTime = value;
    setProgresso(value);
  }
  const total = Math.max(Math.floor(Number(duracaoAudio) || 0), 1);
  return (
    <footer className="player">
      <audio
        ref={audioRef}
        autoPlay={Boolean(musica.audio_url)}
        onLoadedMetadata={carregarDuracao}
        onTimeUpdate={atualizarProgresso}
        onEnded={avancarOuRepetir}
      />
      <div className="player-track">
        <Cover song={musica} size="small" />
        <div>
          <strong>{musica.titulo}</strong>
          <span>{musica.artista}</span>
        </div>
      </div>
      <div className="player-controls">
        <div className="control-buttons">
          <button
            type="button"
            title="Faixa anterior"
            onClick={() => mudarFaixa(-1)}
          >
            <SkipBack size={17} />
          </button>
          <button className="play-button" type="button" onClick={toggle}>
            {tocando ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            title="Próxima faixa"
            onClick={() => mudarFaixa(1)}
          >
            <SkipForward size={17} />
          </button>
        </div>
        <div className="progress">
          <span>{duration(progresso)}</span>
          <input
            aria-label="Progresso da música"
            type="range"
            min="0"
            max={total}
            step="1"
            value={Math.floor(Math.min(progresso, total))}
            onChange={buscar}
          />
          <span>{duration(total)}</span>
        </div>
      </div>
    </footer>
  );
}
