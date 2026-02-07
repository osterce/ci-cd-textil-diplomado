import { Route, Routes, Navigate } from "react-router"
import RootLayout from "./layouts/root.layout"
import PublicLayout from "./layouts/public.layout"
import AdminLayout from "./layouts/admin.layout"
import AuthLayout from "./layouts/auth.layout"
import HomePage from "./pages/public/home.page"
import DashboardPage from "./pages/admin/dashboard.page"
import ProfilePage from "./pages/admin/profile.page"
import InventoryPage from "./pages/admin/inventory"
import LoginPage from "./pages/auth/login.page"
import RegisterPage from "./pages/auth/register.page"
import NotFoundPage from "./pages/public/not-found.page"
import Products from "./pages/admin/products"
import { ThemeProvider } from "./components/theme-provider"
import UsersPage from "./pages/admin/users/users.page"
import RolesPage from "./pages/admin/users/roles.page"
import PermissionsPage from "./pages/admin/users/permissions.page"

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<RootLayout />} >

          {/* Redirect root to login */}
          <Route
            index
            element={<Navigate to="/auth/login" replace />}
          />

          {/* Public */}
          <Route element={<PublicLayout />} >
            <Route
              path="home"
              element={<HomePage />}
            />
            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Route>

          {/* Private */}
          <Route path="admin" element={<AdminLayout />} >
            <Route
              index
              element={<DashboardPage />}
            />
            <Route
              path="inventory"
              element={<InventoryPage />}
            />
            <Route
              path="products"
              element={<Products />}
            />
            <Route path="users">
              <Route index element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
            </Route>
            <Route
              path="profile"
              element={<ProfilePage />}
            />
          </Route>

          {/* Auth */}
          <Route path="auth" element={<AuthLayout />} >
            <Route
              path="login"
              element={<LoginPage />}
            />
            <Route
              path="register"
              element={<RegisterPage />}
            />
          </Route>

        </Route>
      </Routes>
    </ThemeProvider>
  )
}
export default App