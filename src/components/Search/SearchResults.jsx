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
  Avatar,
  Link,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ref, onValue } from 'firebase/database';
import { db } from '@/configs/firebaseConfig';

const SearchResults = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('query');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchResults = () => {
      if (!queryParam) return;

      console.log('Fetching results for query:', queryParam);
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
              (user.handle && user.handle.toLowerCase().includes(queryParam.toLowerCase())) ||
              (user.email && user.email.toLowerCase().includes(queryParam.toLowerCase()))
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
              id,
              ...team,
            })).filter((team) =>
              team.teamName && team.teamName.toLowerCase().includes(queryParam.toLowerCase())
            );
            resolve(teams);
          } else {
            resolve([]);
          }
        });
      });

      Promise.all([fetchUsers, fetchTeams]).then(([users, teams]) => {
        const combinedResults = [
          ...users.map(user => {
          const userTeams = teams.filter(team => team.members && Object.keys(team.members).includes(user.uid));
          return { ...user, type: 'user', teams: userTeams };
        }),
        ...teams.map(team => {
          const teamMembers = users.filter(user => team.members && Object.keys(team.members).includes(user.uid));
          return { ...team, type: 'team', members: teamMembers };
        })
      ];
        console.log('Combined results:', combinedResults);
        setUsers(users);
        setTeams(teams);
        setLoading(false);
      }).catch((error) => {
        console.error('Error fetching search results:', error.message);
        setLoading(false);
      });
    };

    fetchResults();
  }, [queryParam]);

  const handleClick = (id, type) => {
    console.log(`Navigating to ${type} with id: ${id}`);
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
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" mb={2}>Users</Typography>
              {users.length > 0 ? (
                users.map((user) => (
                  <Card key={user.uid} sx={{ mb: 4 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" flexDirection="column">
                        <Avatar
                          alt={user.handle}
                          src={user.photo || '/default-avatar.jpg'}
                          sx={{ width: 60, height: 60, mb: 0.5 }}
                        />
                        <Box>
                          <Typography
                            variant="h5"
                            component="div"
                            onClick={() => handleClick(user.uid, 'user')}
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, mb: 0.5 }}
                          >
                            {user.handle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {user.email}
                          </Typography>
                          {user.teams && user.teams.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Teams: {user.teams.map((team) => team.teamName).join(', ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Box display="flex" justifyContent="center" width="100%">
                        <Button
                          onClick={() => handleClick(user.uid, 'user')}
                          sx={{
                            color: theme.palette.mode === 'dark' ? 'black' : 'white',
                            backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                          }} 
                          variant="contained"
                          size="small"
                        >
                          View Profile
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Typography>No users found.</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" mb={2}>Teams</Typography>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <Card key={team.id} sx={{ mb: 4 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" flexDirection="column">
                        <Avatar
                          alt={team.teamName}
                          src={team.photo || '/default-avatar.jpg'}
                          sx={{ width: 60, height: 60, mb: 0.5 }}
                        />
                        <Box>
                          <Typography
                            variant="h5"
                            component="div"
                            onClick={() => handleClick(team.id, 'team')}
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, mb: 0.5 }}
                          >
                            {team.teamName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {team.description}
                          </Typography>
                          {team.members && team.members.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Members: {team.members.map((member) => (
                                <Link
                                  key={member.uid}
                                  onClick={() => handleClick(member.uid, 'user')}
                                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                >
                                  {member.handle}
                                </Link>
                              )).reduce((prev, curr) => [prev, ', ', curr])}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Box display="flex" justifyContent="center" width="100%">
                        <Button
                          onClick={() => handleClick(team.id, 'team')}
                          sx={{
                            color: theme.palette.mode === 'dark' ? 'black' : 'white',
                            backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                          }} 
                          variant="contained"
                          size="small"
                        >
                          View Team
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Typography>No teams found.</Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};
export default SearchResults;