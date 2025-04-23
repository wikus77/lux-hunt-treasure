
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <App>
    {/* This empty fragment ensures children prop is passed */}
    <></>
  </App>
);
