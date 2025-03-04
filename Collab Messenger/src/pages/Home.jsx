import { NavLink } from 'react-router-dom';
import Logout from '../features/auth/Logout';

const Home = () => {
  return (
    <div>
 
      <Logout />
      <h1>Home page!</h1>
    </div>
  );
};

export default Home;
