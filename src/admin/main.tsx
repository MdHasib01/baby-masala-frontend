import { createRoot } from 'react-dom/client';
import { setTokenKey } from '../services/api';
import { AdminApp } from './AdminApp';
import '../index.css';

// Its own session: signing in or out here doesn't touch the app's login.
setTokenKey('babycare_admin_token');

createRoot(document.getElementById('root')!).render(<AdminApp />);
