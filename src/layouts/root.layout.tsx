import { Outlet } from "react-router"
import { Toaster } from "sonner"

const RootLayout = () => {
  return (
    <div>
      <Outlet />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
        richColors
      />
    </div>
  )
}
export default RootLayout