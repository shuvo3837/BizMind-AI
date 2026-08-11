import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';

const EMPTY_PROFILE = {
  companyName: '',
  industry: '',
  currency: 'USD',
  monthlyTarget: 0,
  employeesCount: 0,
  website: '',
  description: '',
};

export const BusinessProfilePage = () => {
  const { business, loading: ctxLoading, error: ctxError, refresh, updateBusiness } = useBusiness();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (business && business.id) {
      setProfile({
        companyName: business.companyName || '',
        industry: business.industry || '',
        currency: business.currency || 'USD',
        monthlyTarget: business.monthlyTarget ?? 0,
        employeesCount: business.employeesCount ?? 0,
        website: business.website || '',
        description: business.description || '',
      });
    }
  }, [business?.id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      const payload = {
        companyName: profile.companyName,
        industry: profile.industry,
        currency: profile.currency,
        monthlyTarget: Number(profile.monthlyTarget) || 0,
        employeesCount: Number(profile.employeesCount) || 0,
        website: profile.website,
        description: profile.description,
      };
      await updateBusiness(payload);
      setSaveMessage('Business profile updated successfully');
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update business profile';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Business Profile Management">
      <Card title="Company Information & Target Parameters" className="max-w-3xl">
        {ctxLoading && !business?.id && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Loading business profile...
          </p>
        )}
        {ctxError && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">{ctxError}</p>
        )}

        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
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

          {saveMessage && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{saveMessage}</p>
          )}
          {saveError && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{saveError}</p>
          )}

          <Button type="submit" variant="primary" disabled={saving || ctxLoading}>
            {saving ? 'Updating...' : 'Update Business Profile'}
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
};
