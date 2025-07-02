import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/UseAuth";

//auth
import ResetPasswordPage from "./Components/auth/ResetPasswordPage";
import Loginpage from "./Components/auth/Loginpage";
import Regiserpage from "./Components/auth/Registerpage";

//user
import Profilepage from "./Components/user/Profilepage";
import Settingpage from "./Components/user/Settingpage";
import History from "./Components/auth/History";

//video
import Homepage from "./Components/video/Homepage";
import Videopage from "./Components/video/Videopage";
import VideoDetailpage from "./Components/video/VideoDetailpage";

//playlist
import CreatePlaylist from "./Components/playlist/CreatePlaylist";
import Playlistpage from "./Components/playlist/Playlistpage";

//dashboard
import Dashboardpage from "./Components/dashboard/Dashboardpage";
import ProtectedRoute from "./Components/ProtectedRoutes";

//layout
import Layout from "./layoout/Layout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes - No Layout (typically full screen) */}
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Regiserpage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* All other routes with Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Homepage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute>
                        <Videopage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/video/:videoId" element={<VideoDetailpage />} />
                  <Route
                    path="/profile/:_id"
                    element={
                      <ProtectedRoute>
                        <Profilepage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settingpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/playlists"
                    element={
                      <ProtectedRoute>
                        <Playlistpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/playlists/create"
                    element={
                      <ProtectedRoute>
                        <CreatePlaylist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboardpage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
