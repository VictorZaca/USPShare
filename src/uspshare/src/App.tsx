import './App.css'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/pages/ProtectedRoute'
import { LoginPage, SignupPage } from './components/pages/Auth'
import PieMenu from './components/pages/PieMenu'
import { Box, Flex } from '@chakra-ui/react'
import HomePage from './components/pages/HomePage'
import ResourceListPage from './components/pages/ResourceListPage'
import ResourceDetailPage from './components/pages/ResourceDetailPage'
import ShareFormPage from './components/pages/ShareFormPage'
import ProfilePage from './components/pages/ProfilePage'

function App() {
  const navigate = useNavigate()
  return (
    <>
      <Flex as="nav" bg="blue.800" color="white" p={4} align="center">
        <Box fontWeight="bold" mr={6}>USPShare</Box>
        <Link to="/" style={{ marginRight: '16px' }}>Home</Link>
        <Link to="/resources" style={{ marginRight: '16px' }}>Recursos</Link>
        <Link to="/share" style={{ marginRight: '16px' }}>Compartilhar</Link>
        <Link to="/profile">Perfil</Link>
      </Flex>
      <Box p={6}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourceListPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/share" element={<ShareFormPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          
            <Route path="/pie" element={
              <ProtectedRoute>
                <PieMenu />
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
      </Box>
    </>
  )
}

export default App
