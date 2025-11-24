import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../configs/firebaseConfig';

const storage = getStorage(app);

export const uploadAvatar = async (userId, file) => {
  const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};