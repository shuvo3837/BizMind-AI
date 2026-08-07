import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    industry: 'SaaS & Digital Commerce'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Register Your Business" subtitle="Create your BizMind AI platform workspace">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          name="name"
          placeholder="Alex Vance"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Company / Business Name"
          name="companyName"
          placeholder="Apex Growth Dynamics"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="alex@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" isLoading={loading} className="w-full mt-2">
          Create Account
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
