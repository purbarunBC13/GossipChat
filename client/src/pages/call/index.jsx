import { useSocket } from "@/context/SocketContext";
import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

const VideoCall = () => {
  const { socket, call, callUser, acceptCall } = useSocket();
  const myVideo = useRef(null); // Local video reference
  const userVideo = useRef(null); // Remote video reference
  const { recipientId } = useParams();

  useEffect(() => {
    // Request access to the user's camera and microphone
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Debugging: Log that we received the stream
        console.log("Local stream obtained:", stream);

        // Set the local stream to the video element
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
          console.log("Local video element found and stream set.");
        } else {
          console.error("Local video element not found.");
        }

        // Automatically accept incoming call if there's one
        if (call && call.isReceiving) {
          console.log("Incoming call received. Accepting call.");
          acceptCall(stream);
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });
  }, [call, acceptCall]);

  const handleCallUser = () => {
    if (recipientId && myVideo.current.srcObject) {
      console.log("Initiating call to recipient:", recipientId);
      callUser(recipientId, myVideo.current.srcObject); // Use the stream directly
    } else {
      console.error("Recipient ID or local stream not available.");
    }
  };

  return (
    <div>
      <h1>Video Call</h1>
      <button onClick={handleCallUser}>Call User</button>
      <div>
        {/* Local Video */}
        <video ref={myVideo} autoPlay muted style={{ width: "300px" }} />
        {/* Remote Video */}
        <video
          id="remote-video"
          ref={userVideo}
          autoPlay
          style={{ width: "300px" }}
        />
      </div>
      {call && call.isReceiving && (
        <button onClick={() => acceptCall(myVideo.current.srcObject)}>
          Accept Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
