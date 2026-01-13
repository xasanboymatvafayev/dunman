
import React, { useState, useEffect } from 'react';
import { UserView } from './views/UserView';
import { AdminView } from './views/AdminView';
import { ShoppingBag, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  // In a real Telegram bot, you'd check the user ID from window.Telegram.WebApp
  // Here we provide a simple toggle for demonstration purposes.

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-x-hidden">
      {/* Navigation Switcher (Floating Toggle for the UI Demo) */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className="bg-white/90 backdrop-blur shadow-lg p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          {isAdmin ? (
            <ShoppingBag className="w-6 h-6 text-pink-600" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-slate-800" />
          )}
        </button>
      </div>

      <main className="flex-1 pb-20">
        {isAdmin ? <AdminView /> : <UserView />}
      </main>

      {/* Footer Info */}
      <footer className="py-6 px-4 text-center text-slate-400 text-xs">
        <p>&copy; 2024 Luxury Boutique. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
