import { motion } from 'framer-motion';
import ChatContainer from './components/Chat/ChatContainer';
import NotificationBell from './components/Notifications/NotificationBell';
import { ChatProvider } from './context/ChatContext';
import './App.css';

function App() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-4 flex flex-col">
        {/* Header */}
        <header className="max-w-4xl w-full mx-auto mb-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-primary-800">EventFinder</h1>
            <p className="text-sm text-gray-600">Find events you'll love through chat</p>
          </motion.div>
          
          <NotificationBell />
        </header>
        
        {/* Main content */}
        <main className="flex-1 max-w-4xl w-full mx-auto">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ChatContainer />
          </motion.div>
        </main>
        
        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-gray-500 max-w-4xl w-full mx-auto">
          <p>© 2025 EventFinder - Chat-based event recommendations</p>
        </footer>
      </div>
    </ChatProvider>
  );
}

export default App;