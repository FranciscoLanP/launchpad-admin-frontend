import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, Package, ShoppingCart } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Building2 className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              BusinessHub
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl">
              The complete business management platform for modern entrepreneurs. 
              Manage products, customers, orders, and subscriptions all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Package className="h-8 w-8 text-white mx-auto mb-3" />
              <p className="text-white font-medium">Products</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-white mx-auto mb-3" />
              <p className="text-white font-medium">Customers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <ShoppingCart className="h-8 w-8 text-white mx-auto mb-3" />
              <p className="text-white font-medium">Orders</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Building2 className="h-8 w-8 text-white mx-auto mb-3" />
              <p className="text-white font-medium">Analytics</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
