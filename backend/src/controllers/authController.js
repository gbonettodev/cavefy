import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../database/connection.js';

const cadastroSchema = z.object({ nome: z.string().trim().min(2).max(80), email: z.string().email(), senha: z.string().min(6).max(100) });
const loginSchema = z.object({ email: z.string().email(), senha: z.string().min(1) });
const perfilSchema = z.object({ nome: z.string().trim().min(2).max(80), email: z.string().email(), senha: z.string().max(100).refine((value) => !value.trim() || value.length >= 6, 'A nova senha precisa ter pelo menos 6 caracteres.').optional() });
const tokenDe = (usuario) => jwt.sign({ id: usuario.id, papel: usuario.papel }, process.env.JWT_SECRET || 'cavefy-segredo-local', { expiresIn: '7d' });

export async function cadastrar(req, res) {
  const dados = cadastroSchema.parse(req.body);
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  try {
    const { rows } = await pool.query('INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, papel, foto_url', [dados.nome, dados.email.toLowerCase(), senhaHash]);
    return res.status(201).json({ usuario: rows[0], token: tokenDe(rows[0]) });
  } catch (error) { if (error.code === '23505') return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' }); throw error; }
}
export async function login(req, res) {
  const dados = loginSchema.parse(req.body);
  const { rows } = await pool.query('SELECT id, nome, email, papel, foto_url, senha_hash FROM usuarios WHERE email = $1', [dados.email.toLowerCase()]);
  const usuario = rows[0];
  if (!usuario || !(await bcrypt.compare(dados.senha, usuario.senha_hash))) return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
  delete usuario.senha_hash;
  return res.status(200).json({ usuario, token: tokenDe(usuario) });
}
export function perfil(req, res) { return res.status(200).json({ usuario: req.usuario }); }
export async function atualizarPerfil(req, res) { const dados = perfilSchema.parse(req.body); const email = dados.email.toLowerCase(); const foto = req.file ? `${req.protocol}://${req.get('host')}/uploads/capas/${req.file.filename}` : null; const senhaHash = dados.senha?.trim() ? await bcrypt.hash(dados.senha, 10) : null; try { const { rows } = await pool.query('UPDATE usuarios SET nome=$1, email=$2, senha_hash=COALESCE($3,senha_hash), foto_url=COALESCE($4,foto_url) WHERE id=$5 RETURNING id,nome,email,papel,foto_url', [dados.nome, email, senhaHash, foto, req.usuario.id]); const usuario = rows[0]; return res.json({ usuario, token: tokenDe(usuario) }); } catch (error) { if (error.code === '23505') return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' }); throw error; } }
