import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export const cadastroSchema = authSchema.extend({
  nome: z.string().trim().min(2, "Digite seu nome."),
});
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().min(0).optional(),
);
export const musicaSchema = z.object({
  titulo: z.string().trim().min(2, "Digite o título da música."),
  artista: z.string().trim().min(2, "Digite o artista."),
  album: z.string().optional(),
  genero_id: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().positive("Escolha um gênero."),
  ),
  ano: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().min(1900).max(2100).optional(),
  ),
  duracao_segundos: optionalNumber,
  descricao: z.string().max(500).optional(),
});

export { authSchema };
