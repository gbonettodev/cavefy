import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useCavefyStore } from "../store/index";
import AuthPage from "../pages/AuthPage";
import ProtectedLayout from "../layouts/ProtectedLayout";
import "react-toastify/dist/ReactToastify.css";
import "../styles/foundation.css";
import "../styles/auth.css";
import "../styles/shell.css";
import "../styles/catalog.css";
import "../styles/details-forms.css";
import "../styles/playlist-cards.css";
import "../styles/player.css";
import "../styles/playlists.css";
import "../styles/responsive.css";
import "../styles/profile-base.css";
import "../styles/layout.css";
import "../styles/home.css";
import "../styles/profile.css";

const HomePage = lazy(() => import("../pages/HomePage"));
const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const MusicDetailsPage = lazy(() => import("../pages/MusicDetailsPage"));
const MusicFormPage = lazy(() => import("../pages/MusicFormPage"));
const PlaylistsPage = lazy(() => import("../pages/PlaylistsPage"));
const PlaylistDetailsPage = lazy(() => import("../pages/PlaylistDetailsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));

function ProtectedRoute() {
  const usuario = useCavefyStore((state) => state.usuario);
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="route-loader" role="status">
            Carregando CAVEFY...
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<AuthPage key="login" />} />
          <Route path="/cadastro" element={<AuthPage key="cadastro" cadastro />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/musicas" element={<CatalogPage />} />
              <Route path="/musicas/novo" element={<MusicFormPage />} />
              <Route path="/musicas/:id" element={<MusicDetailsPage />} />
              <Route path="/musicas/:id/editar" element={<MusicFormPage editar />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistDetailsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </BrowserRouter>
  );
}
