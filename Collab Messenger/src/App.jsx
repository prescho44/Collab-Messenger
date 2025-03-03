import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppContext } from './store/app.context';
import { useEffect, useState } from 'react';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import { auth } from './configs/firebaseConfig';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData } from './services/users.service';
import Private from './components/Private';
import Public from './components/Public';
import NotFound from './components/NotFound';
import Home from './pages/Home';
import Profile from './features/auth/Profile';

const App = () => {
  const [appState, setAppState] = useState({
    user: null,
    userData: null,
  });

  const [user, loading, error] = useAuthState(auth);

  if (appState.user !== user) {
    setAppState({
      ...appState,
      user,
    });
  }

  useEffect(() => {
    if (!user) return;

    loading && console.log('loading user');
    error && console.log('error loading user');

    getUserData(appState.user.uid)
      .then((data) => {
        const userData = data[Object.keys(data)[0]];
        setAppState({
          ...appState,
          userData,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [user]);

  return (
    <BrowserRouter>
      <Header />

      <AppContext.Provider value={{ ...appState, setAppState }}>
        <Routes>
          <Route element={<Public />}>
            {/* user is not logged in */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Private />}>
            {/* if user is logged */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;
