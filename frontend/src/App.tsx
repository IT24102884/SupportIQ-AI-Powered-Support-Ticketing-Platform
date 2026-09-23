import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { SubmitTicket } from './pages/SubmitTicket';
import { AgentDashboard } from './pages/AgentDashboard';
import { TicketDetail } from './pages/TicketDetail';
import { KbView } from './pages/KbView';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return user?.role === 'agent' ? 'agent-dashboard' : 'customer-tickets';
  });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'agent') {
        setCurrentTab('agent-dashboard');
      } else {
        setCurrentTab('customer-tickets');
      }
      setSelectedTicketId(null);
    }
  }, [user?.role, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-500">Loading SupportIQ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleOpenTicket = (id: string) => {
    setSelectedTicketId(id);
    setCurrentTab('ticket-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedTicketId(null);
    setCurrentTab(user.role === 'agent' ? 'agent-dashboard' : 'customer-tickets');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedTicketId(null);
          setCurrentTab(tab);
        }}
      />

      <main className="flex-1">
        {currentTab === 'customer-tickets' && (
          <CustomerDashboard
            onSelectTicket={handleOpenTicket}
            onGoToSubmit={() => setCurrentTab('submit-ticket')}
          />
        )}

        {currentTab === 'submit-ticket' && (
          <SubmitTicket
            onBack={handleBackToDashboard}
            onTicketCreated={(id) => handleOpenTicket(id)}
          />
        )}

        {currentTab === 'agent-dashboard' && (
          <AgentDashboard onSelectTicket={handleOpenTicket} />
        )}

        {currentTab === 'kb-articles' && <KbView />}

        {currentTab === 'ticket-detail' && selectedTicketId && (
          <TicketDetail
            ticketId={selectedTicketId}
            onBack={handleBackToDashboard}
          />
        )}

        {/* Fallback view if currentTab is somehow unmatched */}
        {currentTab !== 'customer-tickets' &&
          currentTab !== 'submit-ticket' &&
          currentTab !== 'agent-dashboard' &&
          currentTab !== 'kb-articles' &&
          (currentTab !== 'ticket-detail' || !selectedTicketId) && (
            user.role === 'agent' ? (
              <AgentDashboard onSelectTicket={handleOpenTicket} />
            ) : (
              <CustomerDashboard
                onSelectTicket={handleOpenTicket}
                onGoToSubmit={() => setCurrentTab('submit-ticket')}
              />
            )
          )}
      </main>
    </div>
  );
};

export default App;
