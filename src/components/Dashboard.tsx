import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ARVCalculator from './ARVCalculator';
import SubscriptionPrompt from './SubscriptionPrompt';

const Dashboard: React.FC = () => {
  const { user, incrementReports } = useAuth();
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  const handleReportGenerated = () => {
    incrementReports();
    
    // Show subscription prompt after 10 reports
    if (user && user.reportsGenerated >= 9) {
      setShowSubscriptionPrompt(true);
    }
  };

  return (
    <>
      <ARVCalculator onReportGenerated={handleReportGenerated} />
      
      <SubscriptionPrompt
        isOpen={showSubscriptionPrompt}
        onClose={() => setShowSubscriptionPrompt(false)}
      />
    </>
  );
};

export default Dashboard;