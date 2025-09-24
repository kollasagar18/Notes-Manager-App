import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, BookOpen } from 'lucide-react';
import Layout from '../components/Layout';

const UserPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout title="User Portal" showBack>
      <div className="max-w-2xl mx-auto">
        

        <div className="space-y-6">
          {/* Login Option */}
          <div
            onClick={() => navigate('/user/login')}
            className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                <LogIn className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Sign In</h3>
            
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                →
              </div>
            </div>
          </div>

          {/* Register Option */}
          <div
            onClick={() => navigate('/user/register')}
            className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Create Account</h3>
                
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                →
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          
        </div>
      </div>
    </Layout>
  );
};

export default UserPage;