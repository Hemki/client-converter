import { Layout } from "./components/Layout"
import { ThemeProvider } from "./contexts/ThemeProvider"
import { Dashboard } from "./pages/Dashboard"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <Dashboard />
      </Layout>
    </ThemeProvider>
  )
}

export default App
