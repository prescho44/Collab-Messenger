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

const App = () => {
  const [appState, setAppState] = useState({
    user: null,
    userData: null,
  });

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (appState.user !== user) {
      setAppState((prevState) => ({
        ...prevState,
        user,
      }));
    }
  }, [user, appState.user]);

  useEffect(() => {
    if (!user) return;

    loading && console.log('loading user');
    error && console.log('error loading user');

    getUserData(user.uid)
      .then((data) => {
        setAppState((prevState) => ({
          ...prevState,
          userData: data,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }, [user, loading, error]);

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
            <Route path="/teams/:teamId/channels/:channelId" element={<ChatView />} />
          </Route>
          <Route element={<Private />}>
            {/* if user is logged */}
            <Route path="/profile" element={<Profile userId={user?.uid} />} />
            <Route path="/" element={<Home />} />
            <Route path="/new-chat" element={<MakeNewChat />} />
            
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;