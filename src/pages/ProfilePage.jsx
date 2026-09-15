import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Save, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch, BASE_URL } from "../services/api";
import { useCavefyStore } from "../store/index";

function imagemDoPerfil(value) {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  try {
    const parsed = new URL(value, window.location.origin);
    return parsed.pathname.startsWith("/uploads/")
      ? `${new URL(BASE_URL).origin}${parsed.pathname}`
      : value;
  } catch {
    return value;
  }
}
function iniciais(nome = "O") {
  return nome
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const usuario = useCavefyStore((state) => state.usuario);
  const token = useCavefyStore((state) => state.token);
  const entrar = useCavefyStore((state) => state.entrar);
  const sair = useCavefyStore((state) => state.sair);
  const navigate = useNavigate();
  const fotoInputRef = useRef(null);
  const email = usuario?.email || "";
  const [nome, setNome] = useState(usuario?.nome || "");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  function escolherFoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Escolha uma imagem de até 5 MB.");
      event.target.value = "";
      return;
    }
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }
  async function submit(event) {
    event.preventDefault();
    if (nome.trim().length < 2) return toast.error("Digite um nome válido.");
    setSaving(true);
    try {
      {
        const body = new FormData();
        body.append("nome", nome.trim());
        body.append("email", email);
        if (foto) body.append("capa", foto);
        const result = await apiFetch(
          "/auth/me",
          { method: "PUT", body },
          token,
        );
        entrar(result.usuario, result.token || token);
      }
      setFoto(null);
      setFotoPreview("");
      toast.success("Nome e foto do perfil atualizados.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }
  const fotoSalva = imagemDoPerfil(usuario?.foto_url);
  const fotoAtual = fotoPreview || fotoSalva;
  return (
    <div className="profile-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={17} /> Voltar
      </button>
      <div className="profile-page-heading">
        <span className="eyebrow">Sua conta</span>
        <h1>Informações do perfil</h1>
        <p>Atualize seu nome e personalize a sua presença no CAVEFY.</p>
      </div>
      <form className="profile-form" onSubmit={submit}>
        <section className="profile-card profile-identity">
          <div className="profile-avatar-large" style={{ overflow: "visible" }}>
            {fotoAtual ? (
              <img
                src={fotoAtual}
                alt={`Foto de perfil de ${usuario?.nome || nome}`}
                style={{ objectFit: "cover", padding: 0 }}
              />
            ) : (
              <span>{iniciais(usuario?.nome || nome)}</span>
            )}
            <input
              ref={fotoInputRef}
              className="profile-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={escolherFoto}
            />
            <button
              type="button"
              className="profile-camera"
              title="Alterar foto"
              onClick={() => fotoInputRef.current?.click()}
            >
              <Camera size={17} />
            </button>
          </div>
          <div>
            <span className="eyebrow">Foto de perfil</span>
            <h2>{usuario?.nome || "Seu perfil"}</h2>
            <p>
              {foto
                ? "Nova foto selecionada. Clique em salvar para aplicar."
                : "JPG, PNG ou WEBP · até 5 MB"}
            </p>
          </div>
        </section>
        <section className="profile-card">
          <div className="profile-card-heading">
            <UserRound size={19} />
            <div>
              <h2>Dados pessoais</h2>
              <p>Atualize o nome exibido na sua conta.</p>
            </div>
          </div>
          <label className="profile-field">
            <span>Nome</span>
            <div>
              <UserRound size={17} />
              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
              />
            </div>
          </label>
        </section>
        <div className="profile-actions">
          <button
            type="button"
            className="button button-ghost"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button className="button button-gold" disabled={saving}>
            {saving ? "Salvando..." : "Salvar informações"} <Save size={16} />
          </button>
        </div>
      </form>
      <button
        className="profile-logout"
        onClick={() => {
          sair();
          navigate("/login");
        }}
      >
        <ArrowRight size={16} /> Sair da conta
      </button>
    </div>
  );
}
