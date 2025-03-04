import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Box, Flex, Button, Text, Container, HStack } from "@chakra-ui/react";
import { AppContext } from "../../store/app.context";
import Logout from "../../features/auth/Logout";

export default function Header() {
    const { user } = useContext(AppContext);

    return (
        <Box as="header" bg="green.500" py={4} position="sticky" top={0} zIndex={10}>
            <Container maxW="container.xl">
                <Flex justify="space-between" align="center">
                    <Text fontSize="xl" fontWeight="bold" color="white">
                        Talking
                    </Text>
                    <HStack as="nav" spacing={5}>
                        <NavLink to="/">
                            <Button variant="link" color="white">Home</Button>
                        </NavLink>
                        {!user && (
                            <>
                                <NavLink to="/login">
                                    <Button variant="link" color="white">Login</Button>
                                </NavLink>
                                <NavLink to="/register">
                                    <Button variant="link" color="white">Register</Button>
                                </NavLink>
                            </>
                        )}
                    </HStack>
                    {user && (
                        <HStack spacing={4}>
                            <Logout />
                        </HStack>
                    )}
                </Flex>
            </Container>
        </Box>
    );
}