import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Page Not Found (404)</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page you requested could not be located in the Nirikshan platform.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Return to Platform Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
