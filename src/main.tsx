
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/utilities.css'
import './styles/animations.css'
import './styles/micro-interactions.css'
import App from './App.tsx'

// Ensure DOM is fully rendered before mounting
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error("Root element not found");
  }
});
