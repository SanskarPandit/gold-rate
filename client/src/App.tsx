import React, { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { io } from 'socket.io-client';

const socket = io('https://gold-rate-78jb.onrender.com');

const App: React.FC = () => {
  const [role, setRole] = useState<'wholesaler' | 'retailer' | null>(null);
  const [rate, setRate] = useState('');
  const [liveRate, setLiveRate] = useState('');

  const registerForPush = () => {
    PushNotifications.requestPermissions().then(res => {
      if (res.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', token => {
      console.log('FCM Token:', token.value);
      fetch('https://gold-rate-78jb.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value }),
      });
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      alert(`Push Received: ${notification.title} - ${notification.body}`);
    });
  };

  useEffect(() => {
    if (role === 'retailer') {
      registerForPush();
      socket.on('rate-update', data => {
        setLiveRate(data);
      });
    }
  }, [role]);

  const updateRate = async () => {
    await fetch('https://gold-rate-78jb.onrender.com/update-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate }),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {!role ? (
        <>
          <h2>Login</h2>
          <button onClick={() => setRole('wholesaler')}>Login as Wholesaler</button>
          <button onClick={() => setRole('retailer')}>Login as Retailer</button>
        </>
      ) : role === 'wholesaler' ? (
        <>
          <h2>Update Gold Rate</h2>
          <input value={rate} onChange={e => setRate(e.target.value)} placeholder="Enter new rate" />
          <button onClick={updateRate}>Update Rate</button>
        </>
      ) : (
        <>
          <h2>Retailer Mode</h2>
          <h3>Live Gold Rate: ₹{liveRate}</h3>
          <p>Push notifications also enabled</p>
        </>
      )}
    </div>
  );
};

export default App;