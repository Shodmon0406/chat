import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

const ChatMessage = ({ userName, message }) => (
  <div className="bg-blue-100 p-2 rounded mb-2">
    <strong>{userName}:</strong> {message}
  </div>
);

const ChatInput = ({ onSend }) => {
  const [userName, setUserName] = useState("");
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "" && userName.trim() !== "") {
      onSend(userName, input);
      setInput("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="border p-2 flex-1 rounded mt-2"
        placeholder="Enter your name"
      />
      <div className="flex mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1 rounded-l"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      .withUrl("https://row-acb.azurewebsites.net/chat?lid=60")
      .withAutomaticReconnect()
      .build();

    setConnection(connect);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR");

          connection.on("NewChat", (userName, message) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { userName, message },
            ]);
          });
          connection.on("NewMessageInChat", (userName, message) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { userName, message },
            ]);
          });
        })
        .catch((error) => console.log("Connection failed: ", error));
    }
  }, [connection]);

  const handleSend = (userName, message) => {
    if (connection && connection.state === "Connected") {
      connection
        .send("Send", userName, message)
        .catch((error) => console.log("Sending message failed: ", error));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Chat App</h1>
      <div className="border p-4 rounded shadow-sm h-80 overflow-y-scroll">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            userName={msg.userName}
            message={msg.message}
          />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default App;
