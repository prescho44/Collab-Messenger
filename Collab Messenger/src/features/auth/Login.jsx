import { AppContext } from '../../store/app.context';
import { useContext, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';

const Login = () => {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const login = () => {
    if (!user.email || !user.password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    loginUser(user.email, user.password)
      .then((userCredential) => {
        setAppState({
          user: userCredential.user,
          userData: null,
        });
        navigate(location.state?.from.pathname ?? '/');
      })
      .catch((error) => {
        console.error(error.message);
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={user.email}
            onChange={updateUser('email')}
            type="email"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            value={user.password}
            onChange={updateUser('password')}
            type="password"
            required
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={login}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="secondary" />
            ) : (
              'Login'
            )}
          </Button>
        </form>
        <Typography
          variant="body2"
          align="center"
          mt={2}
          pt={2}
          sx={{ borderTop: '1px solid #ccc' }}
        >
          Don't have an account? <Link to="/register" style={{color: '#68c4ff', textDecoration: 'none'}}>Sign up</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
