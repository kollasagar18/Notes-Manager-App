import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';

const ResetOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { email, message } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate('/user/forgot-password');
    }
    if (message) {
      setSuccess(message);
    }
  }, [email, message, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiService.verifyResetOtp({ email, otp: otpCode });

      if (response.success && response.data?.resetToken) {
        setSuccess('OTP verified successfully!');
        // Navigate to reset password with token
        setTimeout(() => {
          navigate('/user/reset-password', {
            state: {
              resetToken: response.data.resetToken,
              email
            }
          });
        }, 1500);
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    
    try {
      const response = await apiService.forgotPassword({ email });
      
      if (response.success) {
        setSuccess('Reset code resent successfully!');
        setOtp(['', '', '', '', '', '']); // Clear previous OTP
      } else {
        setError(response.message || 'Failed to resend reset code');
      }
    } catch (err) {
      setError('An error occurred while resending reset code');
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout title="Verify Reset Code" showBack>
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Verify Reset Code</h2>
            <p className="text-gray-600 text-sm mt-2">
              Enter the 6-digit code sent to {' '}
              <span className="font-medium text-gray-800">{email}</span>
            </p>
          </div>

          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-600 text-sm mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Reset Code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`reset-otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                    maxLength={1}
                    pattern="[0-9]"
                  />
                ))}
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
              {loading ? <LoadingSpinner /> : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-4">Didn't receive the code?</p>
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-800 text-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetOtpPage;