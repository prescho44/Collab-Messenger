import { useEffect, useState, useContext } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { AppContext } from '../store/app.context';

const useFetchTeams = () => {
  const { userData } = useContext(AppContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsRef = ref(db, 'teams');
      onValue(teamsRef, async (snapshot) => {
        const teamsData = snapshot.val();
        if (teamsData) {
          const teamPromises = Object.entries(teamsData).map(
            async ([teamId, team]) => {
              const members = team.members || [];
              const owner = team.owner || '';

              // Filter channels the user belongs to or owns
              const channelPromises = Object.entries(team.channels || {}).map(
                async ([channelId, channelName]) => {
                  const channelParticipantsRef = ref(
                    db,
                    `channels/${teamId}/${channelId}/participants`
                  );
                  const participantsSnapshot = await new Promise((resolve) =>
                    onValue(
                      channelParticipantsRef,
                      (snap) => resolve(snap.val()),
                      { onlyOnce: true }
                    )
                  );
                  const participants = participantsSnapshot || [];
                  if (participants.includes(userData?.handle) || owner === userData?.handle) {
                    return { id: channelId, name: channelName };
                  }
                  return null;
                }
              );

              const filteredChannels = (
                await Promise.all(channelPromises)
              ).filter((channel) => channel !== null);

              // Return the team only if the user is a member or owner
              if (
                members.includes(userData?.handle) ||
                owner === userData?.handle
              ) {
                return {
                  id: teamId,
                  name: team.teamName,
                  owner: owner,
                  members: members, // Add members to the team object
                  channels: filteredChannels,
                };
              }
              return null;
            }
          );

          const filteredTeams = (await Promise.all(teamPromises)).filter(
            (team) => team !== null
          );
          setTeams(filteredTeams);
        } else {
          setTeams([]);
        }
        setLoading(false);
      });
    };

    fetchTeams();
  }, [userData?.handle]);

  return { teams, loading };
};

export default useFetchTeams;