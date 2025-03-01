import { Outlet } from 'react-router-dom';
import Authenticated from '../features/auth/Authenticated';

const Private = () => {
  return (
    <>
      <Authenticated>
        <div>
          <Outlet />
        </div>
      </Authenticated>
    </>
  );
};

export default Private;
