import { VideoCall } from "../components/VideoCall";
import { useContext } from "react";
import { AppContext } from "../store/app.context";
import { useParams } from "react-router-dom";

const VideoCallView = () => {
    const { userData } = useContext(AppContext);
    const { chatId, teamId } = useParams();
    
    return (
        <div className="h-screen w-full">
            <VideoCall roomUrl="https://plamen.daily.co/WBknuGeqwpWn531JiHMY" teamId={teamId} chatId={chatId} userData={userData} />
        </div>
    );
};

export default VideoCallView;