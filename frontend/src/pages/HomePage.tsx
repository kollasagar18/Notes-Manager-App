import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, BookOpen, Users } from 'lucide-react';
import Layout from '../components/Layout';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Notes Manager">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome 
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            
          </p>
        </div>

        {/* Access Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* User Section */}
          <div
            onClick={() => navigate('/user')}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            tabIndex={0}
            role="button"
            aria-label="User Access"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/user')}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">User </h3>
              <p className="text-gray-600 mb-6">
                Access your personal notes, create new ones, and manage your account.
              </p>

            </div>
          </div>

          {/* Admin Section */}
          <div
            onClick={() => navigate('/admin')}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            tabIndex={0}
            role="button"
            aria-label="Admin Access"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin')}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Admin </h3>
              <p className="text-gray-600 mb-6">
                Manage users, oversee all notes, and maintain system administration.
              </p>
              
            </div>
          </div>
        </div>

        {/* Footer / Tagline */}
        <div className="mt-16 text-center">
          
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
