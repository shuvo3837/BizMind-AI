import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';

export const BusinessProfilePage = () => {
  const [profile, setProfile] = useState({
    companyName: 'Apex Growth Dynamics',
    industry: 'SaaS & Digital E-Commerce',
    currency: 'USD',
    monthlyTarget: 150000,
    employeesCount: 24,
    website: 'https://apexgrowth.io',
    description: 'High-growth direct-to-consumer brand offering premium fitness products & automated SaaS subscriptions.'
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout title="Business Profile Management">
      <Card title="Company Information & Target Parameters" className="max-w-3xl">
        <form className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Company Name" name="companyName" value={profile.companyName} onChange={handleChange} />
            <Input label="Industry Category" name="industry" value={profile.industry} onChange={handleChange} />
            <Input label="Reporting Currency" name="currency" value={profile.currency} onChange={handleChange} />
            <Input label="Monthly Target Revenue ($)" type="number" name="monthlyTarget" value={profile.monthlyTarget} onChange={handleChange} />
            <Input label="Total Employees" type="number" name="employeesCount" value={profile.employeesCount} onChange={handleChange} />
            <Input label="Official Website" name="website" value={profile.website} onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Business Overview & Mission
            </label>
            <textarea
              name="description"
              rows={3}
              value={profile.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <Button type="button" variant="primary">
            Update Business Profile
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
};
