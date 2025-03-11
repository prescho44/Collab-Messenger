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
import { ref, onValue } from 'firebase/database';
import { db } from '@/configs/firebaseConfig';
import { AppContext } from '@/store/app.context';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('query');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = () => {
      if (!queryParam) return;

      const usersRef = ref(db, 'users');
      const teamsRef = ref(db, 'teams');


      const fetchUsers = new Promise((resolve) => {
      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const users = Object.values(snapshot.val()).filter((user)=> 
            user.username && user.username.toLowerCase().includes(queryParam.toLowerCase())
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
          const teams = Object.values(snapshot.val()).filter((team) =>
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
    });
  };

  fetchResults();
}, [queryParam]);

  
  const handleClick = (id, type) => {
    if (type === 'user') {
      navigate(`/profile/${id}`);
    }else if (type === 'team') {
    navigate(`/profile/${id}`);
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
                      onClick={() => handleClick(result.uid || result.id, result.username ? 'user' : 'team')}
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    >
                      {result.username || result.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {result.email || result.description}
                    </Typography>
                    </CardContent>
                  <CardActions>
                    <Button
                      onClick={() => handleClick(result.uid || result.id, result.username ? 'user' : 'team')}
                      color="primary"
                      variant="contained"
                      size="small"
                    >
                      View {result.username ? 'Profile' : 'Team'}
                    </Button>
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