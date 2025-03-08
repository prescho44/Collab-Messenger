import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppContext } from './store/app.context';
import { useEffect, useState } from 'react';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import { auth } from './configs/firebaseConfig';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData } from './services/user.service';
import Private from './components/Private';
import Public from './components/Public';
import NotFound from './components/NotFound';
import Home from './pages/Home';
import Profile from './features/auth/Profile';
import Header from './components/Header/Header';
import MakeNewChat from './pages/MakeNewChat';
import ChatView from './pages/ChatView';
import Footer from './components/Footer';
import { Box, CircularProgress } from '@mui/material';
import VideoCall from './components/VideoCall';

const App = () => {
  const [user, loading] = useAuthState(auth);

  const [appState, setAppState] = useState({
    user: null,
    userData: null,
    isInitialized: false
  });

  useEffect(() => {
    if (!loading) {
      setAppState(prev => ({
        ...prev,
        user,
        isInitialized: !user
      }));
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && !appState.userData) {
      getUserData(user.uid)
        .then((data) => {
          setAppState(prev => ({
            ...prev,
            userData: data,
            isInitialized: true
          }));
        })
        .catch((error) => {
          console.error(error);
          setAppState(prev => ({
            ...prev,
            isInitialized: true
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

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...appState, setAppState }}>
        {appState.user && <Header />}
        <Routes>
          <Route element={<Public />}>
            {/* user is not logged in */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Private />}>
            {/* if user is logged */}
            <Route path="/teams/:teamId/channels/:channelId" element={<ChatView />} />
            <Route path="/profile" element={<Profile userId={user?.uid} />} />
            <Route path="/new-chat" element={<MakeNewChat />} />
            <Route path="/video-call" element={<VideoCall />} />
            
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;