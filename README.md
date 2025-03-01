# Collab-Messenger

# Tiered Project Structure for Collab Messenger App (React.js with Vite)

This tiered project structure separates concerns into distinct layers for a React.js application built with Vite. It leverages Vite’s fast build system, React hooks, and Firebase integration for a modern, scalable workflow.

## Proposed Structure

```
/collab-messenger
 ├── /src
 │   ├── /components      → UI elements (Button, Input, Avatar, Message)
 │   ├── /features        → Self-contained features (auth, chat, teams)
 │   │   ├── /auth        → Handles login, register, user profile
 │   │   ├── /chat        → Chat UI, message handling
 │   │   ├── /teams       → Team and channel management
 │   │   ├── /meetings    → (Optional) Voice/video call integration
 │   ├── /services       → Firebase API calls
 │   ├── /hooks          → Custom React hooks for fetching/managing state
 │   ├── /pages          → Page-level components (Dashboard, TeamView, ChatView)
 │   ├── /context        → Global state using React Context (or Zustand)
 │   ├── App.jsx         → Main app entry
 │   ├── main.jsx        → React root render
 │   ├── firebase.js     → Firebase config & initialization
 ├── .env                → Firebase credentials (hidden from Git)
 ├── package.json        → Dependencies
 ├── README.md           → Project setup and guide
```

## Layer Breakdown

1. **API Layer (`src/api/`)**:

   - Interfaces with Firebase Realtime Database, Storage, and Auth.
   - Example: `userApi.js` might export `getUserById`, `updateUserProfile`.

2. **Services Layer (`src/services/`)**:

   - Contains business logic (e.g., validating username length, enforcing team ownership).
   - Mediates between API and components/hooks.
   - Example: `teamService.js` might include `addTeamMember` with owner check.

3. **Presentation Layer (`src/components/`)**:

   - Functional React components using hooks.
   - Split into `common` (reusable), `public` (unauthenticated), and `private` (authenticated).
   - Example: `ChannelView.jsx` renders messages and handles reactions.

4. **Hooks (`src/hooks/`)**:

   - Custom hooks for state and effect management.
   - Example: `useAuth.js` returns current user and login/logout functions.

5. **Contexts (`src/contexts/`)**:

   - Optional React Context for global state (e.g., auth, user data).
   - Alternative to Redux/Zustand if lightweight state management is preferred.

6. **Routes (`src/routes/`)**:

   - Uses React Router (`react-router-dom`) for navigation.
   - `PrivateRoutes.jsx` includes auth checks (e.g., redirect if not logged in).

7. **Utilities (`src/utils/`)**:

   - Helper functions for validation, formatting, etc.
   - Example: `validation.js` might include `isValidEmail`.

8. **Assets (`src/assets/`)**:
   - Images, CSS files, or other static resources (Vite serves these efficiently).

## Why This Structure?

- **Vite-Optimized**: Aligns with Vite’s file-based routing and fast dev server.
- **Modularity**: Layers isolate concerns (e.g., API vs. UI).
- **Scalability**: Easy to add features like meetings by extending hooks/services.
- **Maintainability**: Changes (e.g., swapping Firebase) are confined to the API layer.

## Vite-Specific Notes

- Use `.jsx` for components (or `.tsx` with TypeScript).
- Entry point is `main.jsx` (not `index.js`), per Vite convention.
- Install dependencies: `react`, `react-dom`, `react-router-dom`, `firebase`.
- For state management, add `redux`/`zustand` and a `store/` directory if needed.
- Start with: `npm create vite@latest collab-messenger-app -- --template react`.

## Example Setup

```bash
npm install
npm run dev
```


# Template for Firebase structure

``` json
{
  "users": {
    "userId1": {
      "username": "john_doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "photoUrl": "https://storage.example.com/userId1/photo.jpg",
      "status": "online", // online, offline, busy, away, in a meeting
      "teams": {
        "teamId1": true,
        "teamId2": true
      },
      "channels": {
        "channelId1": true,
        "channelId2": true
      }
    },
    "userId2": {
      "username": "jane_smith",
      "email": "jane@example.com",
      "phoneNumber": "+0987654321",
      "photoUrl": "https://storage.example.com/userId2/photo.jpg",
      "status": "away",
      "teams": {
        "teamId1": true
      },
      "channels": {
        "channelId1": true
      }
    }
  },
  "teams": {
    "teamId1": {
      "name": "Development Crew",
      "owner": "userId1",
      "members": {
        "userId1": true, // Owner is also a member
        "userId2": true
      },
      "channels": {
        "channelId1": true
      }
    },
    "teamId2": {
      "name": "Marketing Squad",
      "owner": "userId1",
      "members": {
        "userId1": true
      },
      "channels": {
        "channelId2": true
      }
    }
  },
  "channels": {
    "channelId1": {
      "title": "General Chat",
      "type": "public", // public or private
      "teamId": "teamId1", // Nullable if not tied to a team (standalone chat)
      "participants": {
        "userId1": true,
        "userId2": true
      },
      "messages": {
        "messageId1": {
          "senderId": "userId1",
          "content": "Hello team!",
          "timestamp": 1677654321,
          "mediaUrl": null, // Optional: link to Firebase Storage
          "reactions": {
            "userId2": "👍"
          },
          "edited": false
        },
        "messageId2": {
          "senderId": "userId2",
          "content": "Hi there!",
          "timestamp": 1677654330,
          "mediaUrl": null,
          "reactions": {},
          "edited": true,
          "originalContent": "Hey there!" // Store original if edited
        }
      }
    },
    "channelId2": {
      "title": "Marketing Plans",
      "type": "private",
      "teamId": "teamId2",
      "participants": {
        "userId1": true
      },
      "messages": {
        "messageId3": {
          "senderId": "userId1",
          "content": "Let’s plan the campaign.",
          "timestamp": 1677654400,
          "mediaUrl": "https://storage.example.com/channelId2/gif.gif",
          "reactions": {},
          "edited": false
        }
      }
    }
  },
  "meetings": {
    "meetingId1": {
      "channelId": "channelId1", // Tie meeting to a channel
      "startTime": 1677655000, // Unix timestamp
      "duration": 3600, // In seconds
      "participants": {
        "userId1": {
          "joinedAt": 1677655005,
          "leftAt": 1677658605
        },
        "userId2": {
          "joinedAt": 1677655010,
          "leftAt": null // Still in meeting
        }
      },
      "notes": {
        "noteId1": {
          "author": "userId1",
          "content": "Discuss project timeline",
          "timestamp": 1677655100
        }
      },
      "recordingUrl": "https://storage.example.com/meetingId1/recording.mp4" // Optional
    }
  }
}
```
