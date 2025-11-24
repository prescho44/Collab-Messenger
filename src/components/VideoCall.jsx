import React, { useEffect, useState, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { useNavigate } from 'react-router-dom';
import { db } from '../configs/firebaseConfig';
import { ref, push, update } from 'firebase/database';

export const VideoCall = ({ roomUrl = "https://plamen.daily.co/WBknuGeqwpWn531JiHMY", teamId, chatId, userData }) => {
    const [callFrame, setCallFrame] = useState(null);
    const callFrameRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const container = document.getElementById('videoContainer');
        if (container && !callFrameRef.current) {
            const frame = DailyIframe.createFrame(container, {
                showLeaveButton: true,
                iframeStyle: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'black',
                    objectFit: 'cover',
                    zIndex: 1001, // Ensure the iframe is above other elements
                },
            });
            setCallFrame(frame);
            callFrameRef.current = frame;
        }
    }, []);

    useEffect(() => {
        if (callFrame && typeof roomUrl === 'string') {
            callFrame.join({ url: roomUrl })
                .then(() => {
                    console.log('Joined room successfully');
                    handleVideoCallStart();
                })
                .catch((error) => {
                    console.error('Error joining room:', error);
                });
        } else {
            console.error('Call frame not ready or roomUrl is not a string');
        }

        return () => {
            if (callFrame) {
                handleVideoCallEnd();
                callFrame.destroy();
            }
        };
    }, [callFrame, roomUrl]);

    const handleVideoCallStart = async () => {
        if (!userData || !userData.handle) {
            console.error('User data or handle is undefined');
            return;
        }
        const messageRef = push(ref(db, `channels/${teamId}/${chatId}/messages`));
        const message = {
            content: "Video call started",
            sender: userData.handle,
            timestamp: new Date().toISOString(),
        };
        await update(messageRef, message);
    };

    const handleVideoCallEnd = async () => {
        if (!userData || !userData.handle) {
            console.error('User data or handle is undefined');
            return;
        }
        const messageRef = push(ref(db, `channels/${teamId}/${chatId}/messages`));
        const message = {
            content: "Video call ended",
            sender: userData.handle,
            timestamp: new Date().toISOString(),
        };
        await update(messageRef, message);
        navigate('/');
    };

    return (
        <div id='videoContainer' className="relative w-full h-full" style={{ backgroundColor: 'black', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        </div>
    );
};

export default VideoCall;