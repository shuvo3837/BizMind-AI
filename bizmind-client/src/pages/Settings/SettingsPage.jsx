import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Account & Workspace Settings">
      <div className="max-w-2xl space-y-6">
        <Card title="User Profile Settings">
          <form className="space-y-4 mt-2">
            <Input label="Full Name" defaultValue={user?.name || 'Alex Vance'} />
            <Input label="Email Address" type="email" defaultValue={user?.email || 'alex@bizmind.ai'} />
            <Input label="Role" defaultValue={user?.role || 'Business Owner'} disabled />
            <Button variant="primary">Save Changes</Button>
          </form>
        </Card>

        <Card title="API Keys & Integrations">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Google Gemini API Key Status</label>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                GEMINI_API_KEY Configured via Platform Secrets Panel
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Groq API Key (Future Integration)</label>
              <Input placeholder="gsk_..." type="password" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
