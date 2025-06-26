
import React, { useState, useMemo, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Import your pages
import Menu from './pages/Menu';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import FeedbackPage from './pages/FeedbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import PrivacyPage from './pages/PrivacyPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import SignupPage from './pages/SignupPage';
import TermsPage from './pages/TermsPage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import AboutPage from './pages/AboutPage';
import Footer from './pages/Footer';
// ... other page imports
import {AuthProvider} from './context/AuthContext'; // Import your AuthProvider
import FilePage from './pages/FilePage';
import AdminPage from './pages/AdminPage';
import { AdminProtectedRoute } from './pages/AdminProtectedRoute';
import { LikesProvider } from './context/LikesContext';
import { CommentLikesProvider } from './context/CommentLikesContext';
import ProtectedRoute from './pages/ProtectedRoute';
import MyUploadsPage from './pages/MyUploadsPage';

// 1. Create and export the context
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const [mode, setMode] = useState<"light" | "dark">('light');

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () => createTheme({ palette: { mode } }),
    [mode]
  );

  return (
    // 2. Provide the context value to the component tree
    <AuthProvider>
      <LikesProvider>
        <CommentLikesProvider>
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>
                {/* 3. The Menu component no longer needs props for theme switching */}
                <Menu />
                <Box component="main">
                  <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path='/forgotpassword' element={<ForgotPasswordPage />} />
                  <Route path="/guide" element={<GuidePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/test" element={<HomePage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/uploads" element={<MyUploadsPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  <Route path="/file/:id" element={<FilePage />} />

                  <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
                  {/* Add other routes as needed */}
                  </Routes>
                </Box>
                <Footer />
              </BrowserRouter>
            </ThemeProvider>
          </ColorModeContext.Provider>
        </CommentLikesProvider>
      </LikesProvider>
    </AuthProvider>
  );
}