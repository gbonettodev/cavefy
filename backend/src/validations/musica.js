import { z } from "zod";

export const musicaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2, "Informe um título com pelo menos 2 caracteres.")
    .max(140),
  artista: z.string().trim().min(2, "Informe o artista.").max(120),
  album: z.string().trim().max(140).optional().or(z.literal("")),
  genero_id: z.coerce.number().int().positive("Selecione um gênero."),
  ano: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")),
  duracao_segundos: z.coerce.number().int().min(0).optional().or(z.literal("")),
  descricao: z.string().trim().max(500).optional().or(z.literal("")),
});
export const playlistSchema = z.object({
  nome: z.string().trim().min(2, "Informe um nome para a playlist.").max(120),
  descricao: z.string().trim().max(240).optional().or(z.literal("")),
});
