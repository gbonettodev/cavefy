import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../services/api";
import { useCavefyStore } from "../store/index";

export function useLibrary() {
  const token = useCavefyStore((state) => state.token);
  const tocarNoPlayer = useCavefyStore((state) => state.tocar);
  const parar = useCavefyStore((state) => state.parar);
  const [musicas, setMusicas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!token) return;
    setCarregando(true);

    const resultados = await Promise.allSettled([
      apiFetch("/musicas", {}, token),
      apiFetch("/generos", {}, token),
      apiFetch("/playlists", {}, token),
    ]);
    const [songs, genres, lists] = resultados;

    if (songs.status === "fulfilled") setMusicas(songs.value);
    if (genres.status === "fulfilled") setGeneros(genres.value);
    if (lists.status === "fulfilled") setPlaylists(lists.value);

    const falha = resultados.find((result) => result.status === "rejected");
    if (falha && falha.reason?.status !== 401) {
      toast.error(falha.reason?.message || "Não foi possível carregar os dados.");
    }
    setCarregando(false);
  }, [token]);

  const recarregarPlaylists = useCallback(async () => {
    const lists = await apiFetch("/playlists", {}, token);
    setPlaylists(lists);
    return lists;
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarMusica(data, files, id) {
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "") body.append(key, value);
    });
    if (files.audio?.[0]) body.append("audio", files.audio[0]);
    if (files.capa?.[0]) body.append("capa", files.capa[0]);

    const result = await apiFetch(
      id ? `/musicas/${id}` : "/musicas",
      { method: id ? "PUT" : "POST", body },
      token,
    );
    setMusicas((current) =>
      id
        ? current.map((item) => (String(item.id) === String(id) ? result : item))
        : [result, ...current],
    );
    return result;
  }

  async function excluirMusica(id) {
    if (!window.confirm("Excluir esta música do catálogo?")) return false;

    try {
      await apiFetch(`/musicas/${id}`, { method: "DELETE" }, token);
      setMusicas((current) => current.filter((item) => String(item.id) !== String(id)));
      if (String(useCavefyStore.getState().musicaAtual?.id) === String(id)) {
        parar();
      }
      toast.success("Música removida do catálogo.");
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  }

  const tocar = useCallback(
    (musica, fila = []) => {
      if (!musica?.audio_url) {
        toast.info("Esta música ainda não possui áudio.");
        return false;
      }

      tocarNoPlayer(musica, fila);
      setMusicas((current) =>
        current.map((item) =>
          String(item.id) === String(musica.id)
            ? { ...item, reproducoes: Number(item.reproducoes || 0) + 1 }
            : item,
        ),
      );

      apiFetch(`/musicas/${musica.id}/reproducoes`, { method: "POST" }, token)
        .then((result) => {
          setMusicas((current) =>
            current.map((item) =>
              String(item.id) === String(musica.id)
                ? { ...item, reproducoes: Number(result.reproducoes || 0) }
                : item,
            ),
          );
        })
        .catch((error) => {
          if (error.status !== 401) {
            console.warn("Não foi possível registrar a reprodução:", error);
          }
        });
      return true;
    },
    [token, tocarNoPlayer],
  );

  return {
    musicas,
    generos,
    playlists,
    carregando,
    salvarMusica,
    excluirMusica,
    tocar,
    reload: carregar,
    recarregarPlaylists,
  };
}
