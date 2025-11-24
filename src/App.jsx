import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AppContext } from './store/app.context';
import { useEffect, useState } from 'react';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import { auth } from './configs/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData } from './services/user.service';
import Private from './components/Private';
import Public from './components/Public';
import NotFound from './components/NotFound';
import Home from './pages/Home';
import Profile from './features/auth/Profile';
import EditProfile from './features/auth/EditProfile';
import Header from './components/Header/Header';
import MakeNewTeam from './pages/MakeNewTeam';
import ChatView from './pages/ChatView';
import Footer from './components/Footer';
import { Box, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import SearchResults from './components/Search/SearchResults';
import 'react-toastify/dist/ReactToastify.css';
import Friends from './features/auth/Friends';
import MakeNewChannel from './pages/MakeNewChannel';
import DirectChatView from './pages/DirectChatView';
import TeamDetails from './TeamsAndUsers/TeamDetails'; 
import VideoCallView from './pages/VideoCallView';

const AppContent = () => {
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [appState, setAppState] = useState({
    user: null,
    userData: null,
    isInitialized: false,
    directChats: [],
  });

  useEffect(() => {
    if (!loading) {
      setAppState((prev) => ({
        ...prev,
        user,
        isInitialized: !user,
      }));
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && !appState.userData) {
      getUserData(user.uid)
        .then((data) => {
          setAppState((prev) => ({
            ...prev,
            userData: data,
            isInitialized: true,
          }));
        })
        .catch((error) => {
          console.error(error);
          setAppState((prev) => ({
            ...prev,
            isInitialized: true,
          }));
        });
    }
  }, [user, appState.userData]);

  if (loading || !appState.isInitialized) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  }

  const isInChatView = location.pathname.includes('/teams/') || location.pathname.includes('/chat/');

  return (
    <AppContext.Provider value={{ ...appState, setAppState }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {appState.user && <Header />}
        <Routes>
          <Route element={<Public />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Private />}>
            <Route path="/teams/:teamId/channels/:channelId" element={<ChatView />} />
            <Route path="/profile" element={<Profile userId={user?.uid} />} />
            <Route path="/profile/:uid" element={<Profile userId={user?.uid} />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/chat/:chatId" element={<DirectChatView />} />
            <Route path="/new-team" element={<MakeNewTeam />} />
            <Route path="/new-channel" element={<MakeNewChannel />} />
            <Route path="/video-call/:teamId/:chatId" element={<VideoCallView />} />
            <Route path="/teams/:teamId" element={<TeamDetails />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        {!isInChatView && <Footer />}
        <ToastContainer />
      </Box>
    </AppContext.Provider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;