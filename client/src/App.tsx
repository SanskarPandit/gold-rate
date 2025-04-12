import React, { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

const BACKEND_URL = 'https://gold-rate-78jb.onrender.com'; 

const App: React.FC = () => {
  const [role, setRole] = useState<'wholesaler' | 'retailer' | null>(null);
  const [rate, setRate] = useState('');

  const registerForPush = async () => {
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive === 'granted') {
      PushNotifications.register();
    }

    PushNotifications.addListener('registration', token => {
      console.log('TOKEN:', token.value);
      fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value }),
      });
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      alert(`Notification: ${notification.title} - ${notification.body}`);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', result => {
      console.log('Action performed', result);
    });
  };

  useEffect(() => {
    if (role === 'retailer') {
      registerForPush();
    }
  }, [role]);

  const sendRate = async () => {
    await fetch(`${BACKEND_URL}/update-rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate }),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {!role ? (
        <>
          <button onClick={() => setRole('wholesaler')}>Login as Wholesaler</button>
          <button onClick={() => setRole('retailer')}>Login as Retailer</button>
        </>
      ) : role === 'wholesaler' ? (
        <>
          <h2>Wholesaler Panel</h2>
          <input value={rate} onChange={e => setRate(e.target.value)} />
          <button onClick={sendRate}>Update Rate</button>
        </>
      ) : (
        <>
          <h2>Retailer Mode</h2>
          <p>Waiting for push notifications...</p>
        </>
      )}
    </div>
  );
};

export default App;
