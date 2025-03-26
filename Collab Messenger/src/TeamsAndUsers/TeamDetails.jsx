import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Avatar, Link, Card, CardContent, CardActions, Button, } from '@mui/material';
import { ref, onValue } from 'firebase/database';
import { db } from '@/configs/firebaseConfig';

const TeamDetails = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamRef = ref(db, `teams/${teamId}`);
    onValue(teamRef, (snapshot) => {
      if (snapshot.exists()) {
        const teamData = snapshot.val();
        console.log('Fetched team data:', teamData); // Debug log
        setTeam(teamData);

        const memberIds = teamData.members ? teamData.members : [];
        console.log('Member IDs:', memberIds); // Debug log
        const memberPromises = memberIds.map((memberId) => {
          return new Promise((resolve) => {
            const memberRef = ref(db, `users/${memberId}`);
            onValue(memberRef, (memberSnapshot) => {
              if (memberSnapshot.exists()) {
                resolve({ uid: memberId, ...memberSnapshot.val() });
              } else {
                resolve(null);
              }
            });
          });
        });

        Promise.all(memberPromises).then((members) => {
            console.log('Fetched members:', members); // Debug log
          setMembers(members.filter((member) => member !== null));
          setLoading(false);
        });

      } else {
        setTeam(null);
        setLoading(false);
      }
    });
  }, [teamId]);

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

  if (!team) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h4">Team not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={5} display="flex" justifyContent="center">
      <Card sx={{ maxWidth: 800, width: '100%', p: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar alt={team.teamName} src={team.photo || '/default-avatar.jpg'} sx={{ width: 100, height: 100, mb: 2 }} />
          <Typography variant="h4" mb={1}>
            {team.teamName}
          </Typography>
        </Box>
        <CardContent>
          <Typography variant="h6" mb={2} textAlign="center">
            Owner:
          </Typography>
          <Box display="flex" justifyContent="center" mb={3}>
            <Avatar alt={team.owner} src={team.ownerPhoto || '/default-avatar.jpg'} sx={{ width: 40, height: 40, mr: 2 }} />
            <Link
              onClick={() => navigate(`/profile/${team.owner.uid}`)}
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              {team.owner}
            </Link>
          </Box>
          <Typography variant="h6" mb={2}>
            Members:
          </Typography>
          {members.length > 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              {members.map((member) => (
                <Box key={member.uid} display="flex" alignItems="center" mb={2}>
                  <Avatar alt={member.handle} src={member.photo || '/default-avatar.jpg'} sx={{ width: 40, height: 40, mr: 2 }} />
                  <Link
                    onClick={() => navigate(`/profile/${member.uid}`)}
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  >
                    {member.handle}
                  </Link>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>No members found.</Typography>
          )}
        </CardContent>
        <CardActions>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            Created On: {team.createdOn}
          </Typography>
          </CardActions>
          <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          </Box>
      </Card>
    </Box>
  );
};


export default TeamDetails;