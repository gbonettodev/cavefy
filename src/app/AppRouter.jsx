import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useCavefyStore } from "../store/index";
import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import CatalogPage from "../pages/CatalogPage";
import MusicDetailsPage from "../pages/MusicDetailsPage";
import MusicFormPage from "../pages/MusicFormPage";
import PlaylistsPage from "../pages/PlaylistsPage";
import PlaylistDetailsPage from "../pages/PlaylistDetailsPage";
import ProfilePage from "../pages/ProfilePage";
import ProtectedLayout from "../layouts/ProtectedLayout";
import "react-toastify/dist/ReactToastify.css";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/home.css";
import "../styles/profile.css";

function ProtectedRoute() {
  const usuario = useCavefyStore((state) => state.usuario);
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/cadastro" element={<AuthPage cadastro />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/musicas" element={<CatalogPage />} />
            <Route path="/musicas/novo" element={<MusicFormPage />} />
            <Route path="/musicas/:id" element={<MusicDetailsPage />} />
            <Route
              path="/musicas/:id/editar"
              element={<MusicFormPage editar />}
            />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetailsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </BrowserRouter>
  );
}
