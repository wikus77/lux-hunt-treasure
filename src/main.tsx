
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/utilities.css'
import './styles/animations.css'
import './styles/micro-interactions.css'
import App from './App.tsx'

// Wrap render in a setTimeout to ensure DOM is fully loaded
setTimeout(() => {
  const rootElement = document.getElementById("root")!;
  createRoot(rootElement).render(<App />);
}, 0);
