import { useContext, useEffect } from 'react';
import { getUserData } from '../../services/user.service';
import { AppContext } from '../../store/app.context';

const Profile = () => {
  const { user } = useContext(AppContext);

  useEffect(() => {
    return getUserData(user.uid).then((data) => (console.log(data)));
  }, []);

  return (
    <div>
      <h1>Profile page!</h1>
      <img src="" alt="" />
    </div>
  );
};

export default Profile;
