import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserData } from "../../services/user.service";
import { createDirectChat } from "../../components/DirectChat/CreateDirectChat";
import {
  Avatar,
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import { AppContext } from "../../store/app.context";
import { db } from "../../configs/firebaseConfig";
import { ref, update } from "firebase/database";

const Profile = ({ userId }) => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { userData: currentUserData } = useContext(AppContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState({});
  const [sendMessageLoading, setSendMessageLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      console.error("No uid provided");
      setLoading(false);
      return;
    }

    getUserData(uid)
      .then((data) => {
        setUserData(data);
        setEditedData(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendMessageLoading(true);
    console.log("Send message button clicked");
    try {
      const chatId = await createDirectChat(currentUserData, userData);
      console.log("Chat created with ID:", chatId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating direct chat:", error.message);
    } finally {
      setSendMessageLoading(false);
      console.log("Send message loading state set to false");
    }
  };

  const handleInviteToTeam = () => {
    console.log("Invite to Team clicked");
  };

  const handleAddFriend = async () => {
    const userRef = ref(
      db,
      `users/${currentUserData.uid}/friends/${userData.uid}`
    );
    await update(userRef, {
      uid: userData.uid,
      username: userData.username,
      email: userData.email,
    });
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  if (loading) {
    return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  }

  if (!userData) {
    return (
      <Typography variant="h6" align="center">
        No user data available
      </Typography>
    );
  }

  const isOwnProfile = uid === userId;

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 450,
        mx: "auto",
        p: 4,
        mt: 5,
        textAlign: "center",
        borderRadius: 3,
      }}
    >
      <Avatar
        alt={userData.handle}
        src={userData.photo || editedData.photo}
        sx={{ width: 120, height: 120, margin: "auto", mb: 2 }}
      />
      <Typography variant="h4" mt={2}>
        {userData.username}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.email}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.handle}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.phoneNumber}
      </Typography>

      {/* Displaying Status */}
      <Typography variant="body2" mt={1} color="textSecondary">
        Status: {userData.status || "No status set"}
      </Typography>

      {isOwnProfile ? (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditProfile}
          >
            Edit Profile
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleSendMessage}
            disabled={sendMessageLoading}
          >
            {sendMessageLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Send Message"
            )}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleInviteToTeam}
          >
            Invite to Team
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddFriend}>
            Add Friend
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default Profile;
