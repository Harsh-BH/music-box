import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@rainbow-me/rainbowkit/styles.css';
import OnchainProviders from './components/OnchainProviders.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OnchainProviders>
    <App />
    </OnchainProviders>
  </StrictMode>,
)
