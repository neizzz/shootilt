import { createRoot } from 'react-dom/client';

import App from '@client/App';
import AppContextProvider from '@client/providers/AppContextProvider';

import './style.css';

const container = document.getElementById('shootilt-app');
const root = createRoot(container as HTMLElement);
root.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>
);

