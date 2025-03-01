import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import {
  createUserHandle,
  getUserByHandle,
} from '../../services/users.service';
import { AppContext } from '../../store/app.context';

export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    handle: '',
    email: '',
    password: '',
    photo: '',
    phoneNumber: '',
  });

  const navigate = useNavigate();

  const register = () => {
    if (!user.email || !user.password) {
      return alert('Please enter email and password');
    }

    getUserByHandle(user.handle)
      .then((userFromDB) => {
        if (userFromDB) {
          throw new Error(`User with handle ${user.handle} already exists`);
        }

        return registerUser(user.email, user.password);
      })
      .then((userCredential) => {
        return createUserHandle(
          user.handle,
          userCredential.user.uid,
          user.email,
          user.photo,
          user.phoneNumber,
        ).then(() => {
          setAppState({
            user: userCredential.user,
            userData: null,
          });
          navigate('/');
        });
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  return (
    <div>
      <h3>Register</h3>
      <div>
        <label htmlFor="handle">Username: </label>
        <input
          value={user.handle}
          onChange={updateUser('handle')}
          type="text"
          name="handle"
          id="handle"
        />
        <br />
        <br />
        <label htmlFor="email">Email: </label>
        <input
          value={user.email}
          onChange={updateUser('email')}
          type="text"
          name="email"
          id="email"
        />
        <br />
        <br />
        <label htmlFor="password">Password: </label>
        <input
          value={user.password}
          onChange={updateUser('password')}
          type="password"
          name="password"
          id="password"
        />
        <br />
        <br />
        <label htmlFor="photo">Photo: </label>
        <input
          value={user.photo}
          onChange={updateUser('photo')}
          type='image'
          name="photo"
          id="photo"
        />
        <br />
        <br />
        <label htmlFor="phoneNumber">Phone number: </label>
        <input
          value={user.phoneNumber}
          onChange={updateUser('phoneNumber')}
          type='tel'
          name="phoneNumber"
          id="phoneNumber"
        />
        <button onClick={register}>Register</button>
      </div>
    </div>
  );
}
