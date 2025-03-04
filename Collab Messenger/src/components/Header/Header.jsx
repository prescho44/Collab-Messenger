import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Container } from "@mui/material";
import { AppContext } from "../../store/app.context";
import Logout from "../../features/auth/Logout";

export default function Header() {
    const { user } = useContext(AppContext);

    return (
        <AppBar position="sticky" sx={{ backgroundColor: "#4caf50" }}>
            <Container maxWidth="xl">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" component="div">
                        Talking
                    </Typography>
                    <nav>
                        <ul style={{ display: "flex", listStyle: "none", gap: "20px" }}>
                            <li>
                                <NavLink to="/" end>
                                    <Button color="inherit">Home</Button>
                                </NavLink>
                            </li>
                            {!user ? (
                                <>
                                    <li>
                                        <NavLink to="/login">
                                            <Button color="inherit">Login</Button>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/register">
                                            <Button color="inherit">Register</Button>
                                        </NavLink>
                                    </li>
                                </>
                            ) : null}
                        </ul>
                    </nav>
                    {user && (
                        <>
                            <Typography variant="body1" sx={{ color: "white" }}>
                                {user.email}
                            </Typography>
                            <Logout />
                        </>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}
