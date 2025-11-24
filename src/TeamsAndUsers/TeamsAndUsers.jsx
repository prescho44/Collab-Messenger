import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import { Box, Typography, Stack } from "@mui/material";

export default function TeamsAndUsers() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const db = getDatabase();

    // Fetch teams
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
      const teamsData = snapshot.val();
      if (teamsData) {
        setTeams(Object.entries(teamsData).map(([id, team]) => ({ id, ...team })));
      } else {
        setTeams([]);
      }
    });

    // Fetch users
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        setUsers(Object.entries(usersData).map(([id, user]) => ({ id, ...user })));
      } else {
        setUsers([]);
      }
    });
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 4, p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <ChatIcon color="inherit" />
        <Typography variant="h6">{teams.length} Teams</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <GroupsIcon color="inherit" />
        <Typography variant="h6">{users.length} Users</Typography>
      </Stack>
    </Box>
  );
}
