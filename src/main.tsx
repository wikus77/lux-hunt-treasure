
import { createRoot } from 'react-dom/client'
import './index.css'
// Theme styles are already imported in index.css
import App from './App.tsx'

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);
