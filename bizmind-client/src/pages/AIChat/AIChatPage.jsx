import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { ChatWindow } from '../../components/ai/ChatWindow.jsx';

export const AIChatPage = () => {
  return (
    <DashboardLayout title="AI Assistant & Strategy Consultant">
      <ChatWindow />
    </DashboardLayout>
  );
};
