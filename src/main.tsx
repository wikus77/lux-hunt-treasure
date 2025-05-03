
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/utilities.css'
import './styles/animations.css'
import './styles/micro-interactions.css'
import App from './App.tsx'

// Forza colore di sfondo e testo
document.documentElement.style.backgroundColor = "#000";
document.documentElement.style.color = "#fff"; 
document.documentElement.classList.add('dark');

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
