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
import Header from './components/Header/Header';

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
  
  loading && console.log('loading user');
  error && console.log('error loading user');

  useEffect(() => {
    if (!user) return;

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
            <Route path="/" element={<Public />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Private />}>{/* if user is logged */}</Route>
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;
