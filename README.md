# Collab-Messenger

Collab-Messenger is a modern, real-time messaging application built with React.js and Vite. It leverages Firebase for authentication, database, and storage, providing a seamless experience for team collaboration, direct messaging, and video calls.

!Example profile: test@gmail.com / 123456

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication.
- **Team Management**: Create and manage teams, channels, and members.
- **Real-Time Messaging**: Send and receive messages instantly with Firebase Realtime Database.
- **Direct Messaging**: Chat privately with other users.
- **Video Calls**: Initiate video calls for team meetings.
- **Customizable Profiles**: Edit user profiles with avatars and status updates.
- **Search Functionality**: Search for users, teams, and messages.

## Project Structure

The project follows a tiered structure for scalability and maintainability:

```
/collab-messenger
 ├── /src
 │   ├── /components      → UI elements (Button, Input, Avatar, Message)
 │   ├── /features        → Self-contained features (auth, chat, teams)
 │   ├── /services        → Firebase API calls
 │   ├── /hooks           → Custom React hooks for fetching/managing state
 │   ├── /pages           → Page-level components (Dashboard, TeamView, ChatView)
 │   ├── /store           → Global state using React Context
 │   ├── App.jsx          → Main app entry
 │   ├── main.jsx         → React root render
 ├── .env                 → Firebase credentials (hidden from Git)
 ├── package.json         → Dependencies
 ├── README.md            → Project setup and guide
```

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/collab-messenger.git
   cd collab-messenger
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed. Then, run:

   ```bash
   npm install
   ```

3. **Set Up Firebase**:

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Firebase Authentication, Realtime Database, and Storage.
   - Add your Firebase configuration to a `.env` file in the root directory:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_DATABASE_URL=your-database-url
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

4. **Start the Development Server**:

   ```bash
   npm run dev
   ```

5. **Access the App**:
   Open your browser and navigate to `http://localhost:5173`.

## Usage

- **Login/Register**: Create an account or log in with your credentials.
- **Create Teams**: Navigate to the "Teams" section to create or join a team.
- **Chat**: Use the chat interface to send messages in channels or direct messages.
- **Video Calls**: Start a video call from the "Meetings" section.
- **Profile Management**: Update your profile information and avatar.

## Deployment

To deploy the app, build the production version and host it on a platform like Firebase Hosting, Vercel, or Netlify:

1. **Build the App**:

   ```bash
   npm run build
   ```

2. **Deploy**:
   Follow the hosting platform's instructions to deploy the `dist/` folder.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## Acknowledgments

- Built with [React.js](https://reactjs.org/) and [Vite](https://vitejs.dev/).
- Powered by [Firebase](https://firebase.google.com/).
- UI components styled with [Material-UI](https://mui.com/).
