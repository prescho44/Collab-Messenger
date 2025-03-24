import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ref, onValue } from 'firebase/database';
import { db } from '@/configs/firebaseConfig';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('query');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchResults = () => {
      if (!queryParam) return;

      setLoading(true);
      
      const usersRef = ref(db, 'users');
      const teamsRef = ref(db, 'teams');

      const fetchUsers = new Promise((resolve) => {
        onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const users = Object.entries(snapshot.val()).map(([uid, user]) => ({
              uid,
              ...user,
            })).filter((user) => 
              user.handle && user.handle.toLowerCase().includes(queryParam.toLowerCase())
            );
            resolve(users);
          } else {
            resolve([]);
          }
        });
      });


      const fetchTeams = new Promise((resolve) => {
        onValue(teamsRef, (snapshot) => {
          if (snapshot.exists()) {
            const teams = Object.entries(snapshot.val()).map(([id, team]) => ({
              id, // Add id to team object
              ...team,
            })).filter((team) =>
              team.name && team.name.toLowerCase().includes(queryParam.toLowerCase())
            );
            resolve(teams);
          } else {
            resolve([]);
          }
        });
      });

      Promise.all([fetchUsers, fetchTeams]).then(([users, teams]) => {
        setResults([...users, ...teams]);
        setLoading(false);
      }).catch((error) => {
        console.error('Error fetching search results:', error.message);
        setLoading(false);
      });
    };

    fetchResults();
  }, [queryParam]);

  const handleClick = (id, type) => {
    if (type === 'user') {
      navigate(`/profile/${id}`);
    } else if (type === 'team') {
      navigate(`/teams/${id}`);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      p={5}
      width="100%"
      display="flex"
      justifyContent="center"
      minHeight="100vh"
    >
      <Stack spacing={8} width="80%" mt={4}>
        <Box p={5}>
          <Typography variant="h4" mb={4}>
            Search Results for "{queryParam}"
          </Typography>
          {results.length > 0 ? (
            <>
              {results.map((result) => (
                <Card key={result.uid || result.id} sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="div"
                      onClick={() => handleClick(result.uid || result.id, result.handle ? 'user' : 'team')}
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    >
                      {result.username || result.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {result.email || result.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Box display="flex" justifyContent="center" width="100%">
                    <Button
                      onClick={() => handleClick(result.uid || result.id, result.handle ? 'user' : 'team')}
                      sx={{
                        color: theme.palette.mode === 'dark' ? 'black' : 'white',
                        backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                      }} 
                      variant="contained"
                      size="small"
                    >
                      View {result.handle ? 'Profile' : 'Team'}
                    </Button>
                    </Box>
                  </CardActions>
                </Card>
              ))}
            </>
          ) : (
            <Typography>No results found.</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default SearchResults;