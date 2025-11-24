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
    status: 'Online',
  };

  await set(ref(db, `users/${handle}`), user);
};

export const getUserData = async (uid) => {
  if (!uid) {
    console.error('UID is required');
    throw new Error('UID is required');
  }

  const userQuery = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
  const snapshot = await get(userQuery);
  if (snapshot.exists()) {
    const users = snapshot.val();
    const userHandle = Object.keys(users)[0];
    return users[userHandle];
  } else {
    console.log('No user data found for UID:', uid); // Debug log
  }
  return null;
};

export const getUserByHandle = async (handle) => {
  const snapshot = await get(ref(db, `users/${handle}`));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

export const updateUserData = async (uid, data) => {
  if (!uid) {
    console.error('UID is required');
    throw new Error('UID is required');
  }

  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  if (snapshot.exists()) {
    const users = snapshot.val();
    const userHandle = Object.keys(users)[0];
    await set(ref(db, `users/${userHandle}`), data);
  } else {
    console.error('No user data found for UID:', uid);
    throw new Error('No user data found for UID');
  }
};

export const checkEmailExists = async (email) => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('email'), equalTo(email)));
  return snapshot.exists();
};

export const checkHandleExists = async (handle) => {
  console.log('Checking handle:', handle); // Debug log
  const snapshot = await get(query(ref(db, 'users'), orderByChild('handle'), equalTo(handle)));
  return snapshot.exists();
};