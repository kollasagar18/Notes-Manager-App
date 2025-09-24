import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Eye, EyeOff, LogIn } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let credentials;
    if (loginType === 'email') {
      credentials = { email: formData.email.trim(), password: formData.password.trim() };
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }
      credentials = { phone: `+91${cleanPhone}`, password: formData.password.trim() }; // ✅ prepend +91
    }

    try {
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        login(response.data.token, response.data.user, false);
        navigate('/user/notes');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign In" showBack>
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <LogIn className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 text-sm mt-2">Sign in to access your notes</p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {['email', 'phone'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLoginType(type as 'email' | 'phone')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-300 ${
                  loginType === type ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email / Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={loginType === 'email' ? 'email' : 'tel'}
                value={loginType === 'email' ? formData.email : formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [loginType]: loginType === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value,
                  }))
                }
                maxLength={loginType === 'phone' ? 10 : undefined}
                placeholder={loginType === 'email' ? 'Enter your email' : 'Enter 10-digit phone number'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/user/forgot-password')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Forgot your password?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/user/register')}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserLoginPage;
