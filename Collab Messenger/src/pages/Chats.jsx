import { db } from "../configs/firebaseConfig";
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Box, Text, List, ListItem, VStack, Card, CardBody, Divider, Badge } from "@chakra-ui/react";

export default function Chats() {   
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const postsRef = ref(db, 'teams');
        onValue(postsRef, (snapshot) => {
            const postsData = snapshot.val();
            if (postsData) {
                const teamsList = Object.entries(postsData).map(([id, team]) => ({
                    id,
                    name: team.name || "Unnamed Team",
                    owner: team.owner || "Unknown Owner",
                    channels: team.channels ? Object.keys(team.channels) : [],
                    members: team.members ? Object.keys(team.members) : [],
                }));
                setTeams(teamsList);
            } else {
                setTeams([]);
            }
        });
    }, []);

    return (
        <Box p={5}>
            <Text fontSize="2xl" fontWeight="bold" mb={5} textAlign="center">Your Chats!</Text>
            
            {teams.length === 0 ? (
                <Text color="gray.500" textAlign="center">No teams available</Text>
            ) : (
                <List spacing={4}>
                    {teams.map((team) => (
                        <ListItem key={team.id}>
                            <Card variant="outline" borderColor="gray.300" borderRadius="lg" p={4}>
                                <CardBody>
                                    <Text fontSize="xl" fontWeight="semibold">{team.name}</Text>
                                    <Text color="gray.600" mb={2}>Owner: {team.owner}</Text>
                                    <VStack align="flex-start" spacing={2} divider={<Divider />}>
                                        <Text fontSize="md" fontWeight="bold" color="blue.500">Channels:</Text>
                                        {team.channels.length > 0 ? (
                                            team.channels.map((channelId, index) => (
                                                <Badge key={index} colorScheme="green" borderRadius="md">
                                                    {channelId}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Text color="gray.400">No channels</Text>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}
