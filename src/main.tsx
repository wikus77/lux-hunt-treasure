
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import './styles/utilities.css'
import './styles/animations.css'
import './styles/micro-interactions.css'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);
