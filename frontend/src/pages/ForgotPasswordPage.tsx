import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, KeyRound } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let payload: { email?: string; phone?: string };

      if (identifier.includes('@')) {
        // Email reset
        payload = { email: identifier.trim() };
      } else {
        // Phone reset (auto add +91 if missing)
        let formattedPhone = identifier.trim();
        if (!formattedPhone.startsWith('+91')) {
          formattedPhone = `+91${formattedPhone}`;
        }
        payload = { phone: formattedPhone };
      }

      const response = await apiService.forgotPassword(payload);

      if (response.success) {
        navigate('/user/reset-otp', {
          state: {
            ...payload,
            message: response.message,
          },
        });
      } else {
        setError(response.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('An error occurred while sending reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Forgot Password" showBack>
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <KeyRound className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
            <p className="text-gray-600 text-sm mt-2">
              Enter your email or phone number and we&apos;ll send you a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <div className="relative">
                {identifier.includes('@') ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-orange-800 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner /> : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/user/login')}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
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

export default ForgotPasswordPage;
