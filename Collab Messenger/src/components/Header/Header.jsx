import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Box, Flex, Button, Text, Container, HStack } from "@chakra-ui/react";
import { AppContext } from "../../store/app.context";
import Logout from "../../features/auth/Logout";

export default function Header() {
  const { user } = useContext(AppContext);

  return (
    <Box
      as="header"
      bg="gray.600"
      py={5}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <NavLink to="/">Discord Clone</NavLink>
          <HStack as="nav" spacing={5}>
            {!user && (
              <>
                <NavLink to="/login">
                  <Button variant="outline" color="white">
                    Login
                  </Button>
                </NavLink>
                <NavLink to="/register">
                  <Button variant="outline" color="white">
                    Register
                  </Button>
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
