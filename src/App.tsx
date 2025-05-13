
import './App.css';
import { BrowserRouter } from "react-router-dom";
import AppContent from './components/app/AppContent';
import CookiebotInit from './components/cookiebot/CookiebotInit';

/**
 * Root component of the application.
 * This is the entry point for the entire React tree.
 */
function App() {
  console.log("App component rendering");
  
  return (
    <BrowserRouter>
      {/* Initialize Cookie Script helper only once at root level */}
      <CookiebotInit />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
