// lib/pusher.js
import Pusher from 'pusher';

if (!process.env.PUSHER_APP_ID) {
  throw new Error('PUSHER_APP_ID is not defined');
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
});

export default pusher;