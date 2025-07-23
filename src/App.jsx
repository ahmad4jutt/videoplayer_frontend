import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

//auth
import ResetPasswordPage from "./Components/auth/ResetPasswordPage";
import Loginpage from "./Components/auth/Loginpage";
import Regiserpage from "./Components/auth/Registerpage";

//user
import Profilepage from "./Components/user/Profilepage";
import Settingpage from "./Components/user/Settingpage";
import History from "./Components/auth/History";
import Subscription from "./Components/user/Subscription";

//video
import Homepage from "./Components/video/Homepage";
import Videopage from "./Components/video/Videopage";
import VideoDetailpage from "./Components/video/VideoDetailpage";
import ChannelVideoPage from "./Components/video/ChannelVideoPage";
import UserChannelPage from "./Components/video/UserChannelPage";

//playlist
import CreatePlaylist from "./Components/playlist/CreatePlaylist";
import Playlistpage from "./Components/playlist/Playlistpage";
import PlaylistById from "./Components/playlist/PlaylistById";

//dashboard
import Dashboardpage from "./Components/dashboard/Dashboardpage";
import ProtectedRoute from "./Components/ProtectedRoutes";

//layout
import Layout from "./layoout/Layout";
import LikedVideo from "./Components/video/LikedVideo";
// subscription
import Subscribers from "./Subscription/Subscribers";
import SubscribedChannels from "./Subscription/SubscribedChannels";

//admin
import AdminRoutes from "./admin/AdminRoutes";
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
          <Route path="/admin/*" element={<AdminRoutes />} />
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
                    path="/channel"
                    element={
                      <ProtectedRoute>
                        <ChannelVideoPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/channel/:userId"
                    element={
                      <ProtectedRoute>
                        <UserChannelPage />
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
                  {/* <Route
                    path="/subscriptions/:channelId"
                    element={
                      <ProtectedRoute>
                        <Subscription />
                      </ProtectedRoute>
                    }
                  /> */}
                  <Route
                    path="/subscribers/:channelId"
                    element={
                      <ProtectedRoute>
                        <Subscribers />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/subscribed-channels"
                    element={
                      <ProtectedRoute>
                        <SubscribedChannels />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/video/:videoId" element={<VideoDetailpage />} />
                  <Route path="/liked-videos" element={<LikedVideo />} />
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
                    path="/playlists/:playlistId"
                    element={
                      <ProtectedRoute>
                        <PlaylistById />
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
