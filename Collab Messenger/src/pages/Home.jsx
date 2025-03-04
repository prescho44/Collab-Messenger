import Chats from "./Chats";
import { AppContext } from "../store/app.context";
import { useContext } from "react";

const Home = () => {
const { user } = useContext(AppContext);

  return (
    <div>
      {user ? <Chats /> : <h1>Welcome to Collab Messenger</h1>}
      
    </div>
  );
};

export default Home;
