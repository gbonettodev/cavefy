import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { initials, mediaUrl, primeiroNome } from "../services/media";

export default function ProfileMenu({ usuario, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const nome = primeiroNome(usuario.nome);

  useEffect(() => {
    if (!open) return undefined;

    function closeOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  function abrirPerfil() {
    setOpen(false);
    navigate("/perfil");
  }

  function sair() {
    setOpen(false);
    onLogout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="top-profile"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="profile-menu-options"
      >
        <div className="avatar">
          {usuario.foto_url ? (
            <img src={mediaUrl(usuario.foto_url)} alt="Foto de perfil" />
          ) : (
            initials(nome)
          )}
        </div>
        <span>{nome}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="profile-dropdown" id="profile-menu-options" role="menu">
          <div className="profile-dropdown-user">
            <strong>{nome}</strong>
            <small>{usuario.email}</small>
          </div>
          <button type="button" role="menuitem" onClick={abrirPerfil}>
            <UserRound size={16} /> Informações do perfil
          </button>
          <button type="button" role="menuitem" onClick={sair}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
