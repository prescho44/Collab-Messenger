import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../configs/firebaseConfig';

const useFetchUsers = () => {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        if (usersData) {
          const usersList = Object.keys(usersData);
          setAllUsers(usersList);
        }
      });
    };

    fetchAllUsers();
  }, []);

  return allUsers;
};

export default useFetchUsers;