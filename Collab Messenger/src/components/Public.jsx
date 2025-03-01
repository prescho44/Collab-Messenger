import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AppContext } from '../store/app.context';

const Public = () => {
  const { user } = useContext(AppContext);
  return (
    <>
      {!user && (
        <div>
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Public;
