
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyCmk94RK25h9PSbtddcUhyo-LgfUEzUkQ8",
  authDomain: "telegram-51486.firebaseapp.com",
  projectId: "telegram-51486",
  storageBucket: "telegram-51486.appspot.com",
  messagingSenderId: "196444124111",
  appId: "1:196444124111:web:40f7abc40dccd3fa9898ba",
  measurementId: "G-W73S12S8ZT"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db= getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, analytics };