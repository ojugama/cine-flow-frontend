import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import CarteleraPage from "./pages/CarteleraPage";
import ComprarPage from "./pages/ComprarPage";
import MisComprasPage from "./pages/MisComprasPage";
import AdminUsuariosPage from "./pages/AdminUsuariosPage";
import AdminPeliculasPage from "./pages/AdminPeliculasPage";
import AdminFuncionesPage from "./pages/AdminFuncionesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute clientOnly />}>
        <Route element={<Layout />}>
          <Route path="/cartelera" element={<CarteleraPage />} />
          <Route path="/comprar/:idPelicula" element={<ComprarPage />} />
          <Route path="/mis-compras" element={<MisComprasPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<Layout />}>
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          <Route path="/admin/peliculas" element={<AdminPeliculasPage />} />
          <Route path="/admin/funciones" element={<AdminFuncionesPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
