import './App.css'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/pages/ProtectedRoute'
import { LoginPage, SignupPage } from './components/pages/Auth'

function App() {
  const navigate = useNavigate()
  return (
    <>
      {/* Menu de navegação */}
      <nav>
        <Link to="/">Home</Link>
      </nav>

      {/* Definição das rotas */}
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <h1>Home</h1>
            <p>Bem-vindo à página inicial!</p>
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <LoginPage onSwitch={ () => navigate('/register') }></LoginPage>
        } />
        <Route path="/register" element={
          <SignupPage onSwitch={ () => navigate('/login') } ></SignupPage>
        }
        />
      </Routes>
    </>
  )
}

export default App
