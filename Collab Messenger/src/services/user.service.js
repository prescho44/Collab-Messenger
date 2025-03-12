import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../configs/firebaseConfig';


export const createUserHandle = async (handle, uid, email, photo, phoneNumber) => {

  const user = {
    handle,
    uid,
    email,
    photo,
    phoneNumber,
    createdOn: new Date().toString(),
  };

  await set(ref(db, `users/${handle}`), user);
};

export const getUserData = async (uid) => {
  if (!uid) {
    console.error('UID is required');
    throw new Error('UID is required');
  }

  console.log('Querying user data for UID:', uid); // Debug log
  const userQuery = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
  const snapshot = await get(userQuery);
  if (snapshot.exists()) {
    const users = snapshot.val();
    console.log('Snapshot data:', users); // Debug log
    const userHandle = Object.keys(users)[0];
    return users[userHandle];
  } else {
    console.log('No user data found for UID:', uid); // Debug log
  }
  return null;
};

export const getUserByHandle = async (handle) => {

  const snapshot = await get(ref(db, `users/${handle}`));
  if(snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};