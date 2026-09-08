import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useCavefyStore } from '../store/index';
import { demoUser } from '../data/demo';
import { authSchema, cadastroSchema } from '../validation/schemas';
import Field from '../components/Field';
import logo from '../assets/cavefy-logo.png';
export default function AuthScreen({ cadastro = false }) {
  const navigate = useNavigate(); const entrar = useCavefyStore((state) => state.entrar); const [modoCadastro, setModoCadastro] = useState(cadastro); const [enviando, setEnviando] = useState(false);
  const form = useForm({ resolver: zodResolver(modoCadastro ? cadastroSchema : authSchema), defaultValues: { nome: '', email: '', senha: '' } });
  useEffect(() => { setModoCadastro(cadastro); form.reset({ nome: '', email: '', senha: '' }); }, [cadastro, form]);
  async function submit(data) {
    setEnviando(true);
    try { const result = await apiFetch(modoCadastro ? '/auth/cadastro' : '/auth/login', { method: 'POST', body: JSON.stringify(data) }); entrar(result.usuario, result.token); toast.success(modoCadastro ? 'Conta criada. Bem-vindo ao CAVEFY!' : 'Bem-vindo de volta!'); navigate('/dashboard'); }
    catch (error) { toast.error(error.message.includes('fetch') ? 'API offline. Use o modo demonstração para explorar o projeto.' : error.message); }
    finally { setEnviando(false); }
  }
  function demo() { entrar(demoUser); navigate('/dashboard'); toast.success('Modo demonstração ativado.'); }
  return <main className="auth-screen"><div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" /><section className="auth-card"><div className="auth-brand"><img src={logo} alt="" /><span>CAVEFY</span></div><p className="auth-kicker">MÚSICA DA IDADE DA PEDRA</p><h1>{modoCadastro ? 'Encontre seu próximo som.' : 'Volte para a sua caverna.'}</h1><p className="auth-subtitle">{modoCadastro ? 'Crie seu espaço para catalogar, descobrir e montar playlists.' : 'Sua biblioteca sonora, do seu jeito.'}</p><form className="auth-form" onSubmit={form.handleSubmit(submit)}>{modoCadastro && <Field label="Nome" error={form.formState.errors.nome?.message}><input {...form.register('nome')} placeholder="Como podemos te chamar?" /></Field>}<Field label="E-mail" error={form.formState.errors.email?.message}><input type="email" {...form.register('email')} placeholder="voce@email.com" /></Field><Field label="Senha" error={form.formState.errors.senha?.message}><input type="password" {...form.register('senha')} placeholder="Mínimo de 6 caracteres" /></Field><button className="button button-gold button-wide" disabled={enviando}>{enviando ? 'Entrando...' : modoCadastro ? 'Criar minha conta' : 'Entrar no CAVEFY'} <ArrowRight size={17} /></button></form><button className="demo-link" onClick={demo} type="button"><Sparkles size={15} /> Explorar modo demonstração</button><div className="auth-switch">{modoCadastro ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button onClick={() => navigate(modoCadastro ? '/login' : '/cadastro')} type="button">{modoCadastro ? 'Entrar' : 'Criar conta'}</button></div></section><p className="auth-footer">CAVEFY © 2026 · Feito para quem escuta além do óbvio.</p></main>;
}
