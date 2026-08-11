import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { businessService } from '../services/businessService.js';
import { useAuth } from '../hooks/useAuth.js';

export const BusinessContext = createContext();

export const useBusiness = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return ctx;
};

const DEFAULT_BUSINESS = {
  id: null,
  companyName: '',
  industry: 'General',
  currency: 'USD',
  monthlyTarget: 0,
  employeesCount: 0,
  website: '',
  description: ''
};

export const BusinessProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setBusiness(DEFAULT_BUSINESS);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await businessService.getProfile();
      const data = res?.data?.data || res?.data || null;
      if (data) {
        setBusiness({
          id: data.id || data._id || null,
          companyName: data.companyName || data.businessName || '',
          industry: data.industry || data.category || 'General',
          currency: data.currency || 'USD',
          monthlyTarget: data.monthlyTarget || 0,
          employeesCount: data.employeesCount || 0,
          website: data.website || '',
          description: data.description || ''
        });
      } else {
        setBusiness(DEFAULT_BUSINESS);
      }
    } catch (err) {
      // 404 simply means the user has no business yet — that's fine.
      if (err?.response?.status !== 404) {
        setError(err.message || 'Failed to load business profile');
      }
      setBusiness(DEFAULT_BUSINESS);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateBusiness = async (updates) => {
    setBusiness((prev) => ({ ...prev, ...updates }));
    try {
      const res = await businessService.updateProfile(updates);
      const data = res?.data?.data || res?.data;
      if (data) {
        setBusiness({
          id: data.id || data._id || null,
          companyName: data.companyName || data.businessName || '',
          industry: data.industry || data.category || 'General',
          currency: data.currency || 'USD',
          monthlyTarget: data.monthlyTarget || 0,
          employeesCount: data.employeesCount || 0,
          website: data.website || '',
          description: data.description || ''
        });
      }
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update business');
      throw err;
    }
  };

  const createBusiness = async (payload) => {
    const res = await businessService.create?.(payload);
    if (res) {
      await refresh();
    }
    return res;
  };

  return (
    <BusinessContext.Provider value={{ business, loading, error, refresh, updateBusiness, createBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
};
