import multer from "multer";
import { ZodError } from "zod";

export function notFound(req, res) {
  return res.status(404).json({
    mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      mensagem: error.issues[0]?.message || "Dados inválidos.",
      erros: error.flatten().fieldErrors,
    });
  }

  if (error instanceof multer.MulterError) {
    const mensagem =
      error.code === "LIMIT_FILE_SIZE"
        ? "O arquivo enviado ultrapassa o tamanho permitido."
        : "Não foi possível processar o arquivo enviado.";
    return res.status(400).json({ mensagem });
  }

  const status = Number(error.statusCode) || 500;
  if (status >= 500) {
    console.error(error);
    return res.status(500).json({
      mensagem: "Erro interno do servidor. Tente novamente.",
    });
  }

  return res.status(status).json({
    mensagem: error.message || "Não foi possível concluir a operação.",
  });
}
