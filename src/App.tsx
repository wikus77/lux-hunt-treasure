
import './App.css';
import AppContent from './components/app/AppContent';
import CookiebotInit from './components/cookiebot/CookiebotInit';

/**
 * Root component of the application.
 * This is the entry point for the entire React tree.
 */
function App() {
  console.log("App component rendering");
  
  return (
    <>
      {/* Initialize Cookie Script helper only once at root level */}
      <CookiebotInit />
      <AppContent />
    </>
  );
}

export default App;
