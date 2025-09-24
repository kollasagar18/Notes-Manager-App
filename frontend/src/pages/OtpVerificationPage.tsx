import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { type, identifier, message } = location.state || {};

  useEffect(() => {
    if (!type || !identifier) {
      navigate('/user/register');
    }
    if (message) {
      setSuccess(message);
    }
  }, [type, identifier, message, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
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
      const verificationData = {
        otp: otpCode,
        ...(type === 'email' ? { email: identifier } : { phone: identifier })
      };

      const response = await apiService.verifyOtp(verificationData);

      if (response.success) {
        setSuccess('Account verified successfully!');
        // Automatically redirect to login after verification
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
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
      const resendData = type === 'email' ? { email: identifier } : { phone: identifier };
      const response = await apiService.resendOtp(resendData);
      
      if (response.success) {
        setSuccess('OTP resent successfully!');
        setOtp(['', '', '', '', '', '']); // Clear previous OTP
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('An error occurred while resending OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout title="Verify OTP" showBack>
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Verify Your Account</h2>
            <p className="text-gray-600 text-sm mt-2">
              We've sent a 6-digit code to {' '}
              <span className="font-medium text-gray-800">
                {type === 'email' ? identifier : `${identifier?.slice(0, -4)}****`}
              </span>
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
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
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
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner /> : 'Verify Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-4">Didn't receive the code?</p>
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Resend OTP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OtpVerificationPage;