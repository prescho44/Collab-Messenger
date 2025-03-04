import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import { createUserHandle, getUserByHandle } from '../../services/user.service';
import { AppContext } from '../../store/app.context';
import { storage } from '../../configs/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import defaultProfileImage from '../../assets/default-avatar.jpg';

export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    handle: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const defaultAvatar = defaultProfileImage;

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (uid) => {
    if (!imageFile) return defaultAvatar;
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
  
      // Create a unique filename using timestamp
      const timestamp = Date.now();
      const filename = `${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, `avatars/${uid}/${filename}`);
  
      // Create upload task with progress monitoring
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
  
      // Monitor upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            setIsUploading(false);
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              setUploadProgress(100);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setIsUploading(false);
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const register = async () => {
    // Validate required fields
    if (!user.email || !user.password || !user.handle) {
      return alert('Please fill in all required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return alert('Please enter a valid email address');
    }

    // Validate password strength
    if (user.password.length < 6) {
      return alert('Password must be at least 6 characters long');
    }

    try {
      // Check if username is taken
      const userFromDB = await getUserByHandle(user.handle);
      if (userFromDB) {
        throw new Error(`Username "${user.handle}" is already taken`);
      }

      // Register user
      const userCredential = await registerUser(user.email, user.password);
      console.log('User registered:', userCredential.user.uid); // Debug log      
      // Upload profile image
      const photoURL = await uploadImage(userCredential.user.uid);
      console.log('Photo uploaded:', photoURL); // Debug log
  
      // Create user profile
      await createUserHandle(
        user.handle,
        userCredential.user.uid,
        user.email,
        photoURL,
        user.phoneNumber
      );

      // Update app state
      setAppState({
        user: userCredential.user,
        userData: null,
      });

      // Redirect to home
      navigate('/');

    } catch (error) {
      console.error('Registration error:', error); // Detailed error logging
      alert(error.message);
      }
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      <div className="register-form">
        <div className="avatar-upload">
          <div className="avatar-preview">
            <img
              src={imagePreview || defaultAvatar}
              alt="Profile preview"
              className="avatar-image"
            />
            {isUploading && (
              <div className="upload-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
                <span>{uploadProgress}%</span>
              </div>
            )}
          </div>
          <div className="avatar-edit">
            <label htmlFor="photo" className="upload-button">
              Choose Photo
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="handle">Username *</label>
          <input
            type="text"
            id="handle"
            value={user.handle}
            onChange={updateUser('handle')}
            placeholder="Choose a username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={user.email}
            onChange={updateUser('email')}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            value={user.password}
            onChange={updateUser('password')}
            placeholder="Create a password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number (optional)</label>
          <input
            type="tel"
            id="phoneNumber"
            value={user.phoneNumber}
            onChange={updateUser('phoneNumber')}
            placeholder="Enter your phone number"
          />
        </div>

        <button 
          onClick={register}
          className="register-button"
          disabled={isUploading}
        >
          {isUploading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>

      <style jsx>{`
        .register-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .avatar-upload {
          text-align: center;
        }

        .avatar-preview {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 5px;
        }

        .progress-bar {
          height: 4px;
          background: #4CAF50;
          transition: width 0.3s ease;
        }

        .upload-button {
          display: inline-block;
          padding: 8px 16px;
          background: #f0f0f0;
          border-radius: 20px;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.3s ease;
        }

        .upload-button:hover {
          background: #e0e0e0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .register-button {
          padding: 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .register-button:hover {
          background: #45a049;
        }

        .register-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}