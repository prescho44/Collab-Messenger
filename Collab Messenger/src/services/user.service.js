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
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  if(snapshot.exists()) {
    return snapshot.val();
  }
};

export const getUserByHandle = async (handle) => {

  const snapshot = await get(ref(db, `users/${handle}`));
  if(snapshot.exists()) {
    return snapshot.val();
  }
};