import { AppContext } from '../../store/app.context';
import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import { Box, Button, TextField, Typography, Container, Link, Grid, Paper, CircularProgress } from '@mui/material';

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
      alert('Please enter both email and password.');
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
        alert(error.message);
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
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={user.email}
                onChange={updateUser('email')}
                type="email"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                value={user.password}
                onChange={updateUser('password')}
                type="password"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={login}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="secondary" /> : 'Login'}
              </Button>
            </Grid>
          </Grid>
        </form>
        <Typography variant="body2" align="center" mt={2}>
          Don't have an account?{' '}
          <Link href="/register" variant="body2" sx={{ color: '#1976d2' }}>
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
