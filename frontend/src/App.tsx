import { useAuth } from './hooks/useAuth';
import { useRealtime } from './hooks/useRealtime';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import ToastViewport from './components/ToastViewport';
import './App.css';

function App() {
  const { user, token } = useAuth();
  useRealtime(); // no-op until authenticated; auto-reconnects

  if (!token || !user) {
    return (
      <>
        <LoginPage />
        <ToastViewport />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Dashboard user={user} />
      </div>
      <ToastViewport />
    </ErrorBoundary>
  );
}

export default App;
