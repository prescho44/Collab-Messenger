import React, { useEffect, useState, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

export const VideoCall = ({ roomUrl = "https://plamen.daily.co/WBknuGeqwpWn531JiHMY" }) => {
    const [callFrame, setCallFrame] = useState(null);
    const callFrameRef = useRef(null);

    console.log('Room URL:', roomUrl);

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
            console.log('DailyIframe created:', frame);
        }
    }, []);

    useEffect(() => {
        if (callFrame && typeof roomUrl === 'string') {
            console.log('Joining room with URL:', roomUrl);
            callFrame.join({ url: roomUrl })
                .then(() => {
                    console.log('Joined room successfully');
                })
                .catch((error) => {
                    console.error('Error joining room:', error);
                });
        } else {
            console.log('Call frame not ready or roomUrl is not a string');
        }

        return () => {
            if (callFrame) {
                console.log('Destroying call frame');
                callFrame.destroy();
            }
        };
    }, [callFrame, roomUrl]);

    return (
        <div id='videoContainer' className="relative w-full h-full" style={{ backgroundColor: 'black', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        </div>
    );
};

export default VideoCall;