import { Outlet } from 'react-router-dom';
import Authenticated from '../features/auth/Authenticated';

const Public = () => {
  return (
    <>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Public;
