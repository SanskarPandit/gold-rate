import React, { useEffect, useState } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { io } from "socket.io-client";

const socket = io("https://gold-rate-78jb.onrender.com"); // Use your backend URL

const App: React.FC = () => {
  const [rate, setRate] = useState<string>("");
  const [liveRate, setLiveRate] = useState<string>("");
  
  // Function to register for push notifications
  const registerForPush = async () => {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === "granted") {
      // Register for push notifications
      PushNotifications.register();
    }

    // Handle the registration event to get FCM token
    PushNotifications.addListener("registration", (token) => {
      console.log("FCM Token:", token.value);
      fetch("https://gold-rate-78jb.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.value }),
      });
    });

    // Handle receiving a push notification
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push Notification Received: ", notification);
      alert(`Notification received: ${notification.title} - ${notification.body}`);
    });

    // Handle the push notification when the app is opened from the background
    PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.log("Notification clicked: ", notification);
      alert(`Clicked on notification: ${notification.notification.title}`);
    });
  };

  // When the role is set as 'retailer', listen to real-time updates
  useEffect(() => {
    registerForPush();

    // Listening to WebSocket event for live gold rate updates
    socket.on("rate-update", (newRate) => {
      setLiveRate(newRate);
    });
  }, []);

  const updateRate = async () => {
    await fetch("https://gold-rate-78jb.onrender.com/update-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate }),
    });
  };

  return (
    <div>
      <h2>Gold Rate: ₹{liveRate}</h2>
      <input
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        placeholder="Update rate"
      />
      <button onClick={updateRate}>Update</button>
    </div>
  );
};

export default App;
