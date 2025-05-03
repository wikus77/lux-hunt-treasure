
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css' // Make sure theme styles are loaded
import App from './App.tsx'

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);
