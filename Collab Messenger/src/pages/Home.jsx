import { NavLink } from 'react-router-dom';
import Logout from '../features/auth/Logout';

const Home = () => {
  return (
    <div>
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/register">Register</NavLink>
      <Logout />
      <NavLink to="/profile">Profile</NavLink>
      <h1>Home page!</h1>
    </div>
  );
};

export default Home;
