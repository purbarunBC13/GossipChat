import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Peer } from "peerjs";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const peer = useRef(new Peer(undefined, { path: "/peerjs", host: HOST }));
  const [call, setCall] = useState(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: userInfo.id,
        },
      });
      socket.current.on("connect", () => {
        console.log("connected to socket server");
      });

      //! Listen for incoming calls
      socket.current.on("incoming-call", (data) => {
        setCall({
          isReceiving: true,
          from: data.from,
          signal: data.signal,
        });
      });

      // TODO : ADD NOTIFICATION FOR NEW MESSAGE

      const handleReceiveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          // console.log("Received message: ", message);
          addMessage(message);
        }
      };

      const handleReceiveChannelMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          console.log("Received channel message: ", message);
          addMessage(message);
        }
      };

      socket.current.on("receiveMessage", handleReceiveMessage);

      socket.current.on("recieve-channel-message", handleReceiveChannelMessage);
      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  const callUser = (recipientId, stream) => {
    if (!peer.current) {
      console.error("Peer instance is not initialized.");
      return;
    }

    const call = peer.current.call(recipientId, stream);

    if (!call) {
      console.error(
        "Failed to initiate call. Check if recipientId is valid and connected."
      );
      return;
    }

    call.on("stream", (remoteStream) => {
      document.getElementById("remote-video").srcObject = remoteStream;
    });

    call.on("error", (err) => {
      console.error("Error during call:", err);
    });
  };

  const acceptCall = (stream) => {
    setCall(null);
    const call = peer.current.call(call.from, stream);
    call.answer(call.signal);

    call.on("stream", (remoteStream) => {
      document.getElementById("remote-video").srcObject = remoteStream;
    });

    socket.current.emit("accept-call", {
      callerId: call.from,
      signal: call,
    });
  };
  return (
    <SocketContext.Provider
      value={{ socket: socket.current, call, callUser, acceptCall }}
    >
      {children}
    </SocketContext.Provider>
  );
};
