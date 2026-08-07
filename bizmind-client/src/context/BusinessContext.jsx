import React, { createContext, useState } from 'react';

export const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState({
    id: 'biz_65f1a2b3c4d5e6f7a8b9c0d2',
    companyName: 'Apex Growth Dynamics',
    industry: 'SaaS & Digital E-Commerce',
    currency: 'USD',
    monthlyTarget: 150000,
    employeesCount: 24,
    website: 'https://apexgrowth.io',
    description: 'High-growth direct-to-consumer brand offering premium fitness products & automated SaaS subscriptions.'
  });

  const updateBusiness = (updatedFields) => {
    setBusiness((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <BusinessContext.Provider value={{ business, updateBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
};
