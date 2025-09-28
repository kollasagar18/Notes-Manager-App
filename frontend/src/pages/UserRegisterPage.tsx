import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';

const UserRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [registerType, setRegisterType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ Validation
    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (registerType === 'email' && !formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (registerType === 'phone') {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Enter a valid 10-digit phone number');
        return;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        ...(registerType === 'email'
          ? { email: formData.email.trim() }
          : { phone: `+91${formData.phone.replace(/\D/g, '')}` }), // ✅ prepend +91 for phone
      };

      const response = await apiService.register(userData);

      if (response.success) {
        navigate('/user/verify-otp', {
          state: {
            type: registerType,
            identifier:
              registerType === 'email'
                ? formData.email
                : `+91${formData.phone.replace(/\D/g, '')}`,
            message: response.message,
          },
        });
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Account" showBack>
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Join Notes Manager
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Create your account to get started
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setRegisterType('email')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-300 ${
                registerType === 'email'
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => setRegisterType('phone')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-300 ${
                registerType === 'phone'
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email / Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {registerType === 'email'
                  ? 'Email Address'
                  : 'Phone Number'}
              </label>
              <div className="relative">
                {registerType === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type={registerType === 'email' ? 'email' : 'tel'}
                  value={
                    registerType === 'email'
                      ? formData.email
                      : formData.phone
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [registerType]:
                        registerType === 'phone'
                          ? e.target.value.replace(/\D/g, '') // only digits for phone
                          : e.target.value, // keep full email
                    }))
                  }
                  maxLength={registerType === 'phone' ? 10 : undefined}
                  placeholder={
                    registerType === 'email'
                      ? 'Enter your email'
                      : 'Enter 10-digit phone number'
                  }
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/user/login')}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserRegisterPage;
