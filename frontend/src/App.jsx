import { Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import MenuManagement from "./pages/admin/MenuManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import QRManagement from "./pages/admin/QRManagement";
import Settings from "./pages/admin/Settings";
import ProtectedRoute from "./components/admin/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="items" element={<MenuManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="qr" element={<QRManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Menu />} />
    </Routes>
  );
}
