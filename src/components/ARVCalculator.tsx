import React, { useState } from 'react';
import { Search, MapPin, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ARVCalculatorProps {
  onReportGenerated: () => void;
}

const ARVCalculator: React.FC<ARVCalculatorProps> = ({ onReportGenerated }) => {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastReport, setLastReport] = useState<{
    address: string;
    estimatedValue: number;
    generatedAt: Date;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    
    // Simulate API call to generate ARV report
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock ARV value
    const estimatedValue = Math.floor(Math.random() * 400000) + 200000;
    
    setLastReport({
      address: address.trim(),
      estimatedValue,
      generatedAt: new Date(),
    });
    
    setLoading(false);
    setAddress('');
    onReportGenerated();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ARV Calculator Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Enter a property address to generate an After Repair Value report
        </p>
      </div>

      {/* Usage Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Reports Generated
              </h3>
              <p className="text-sm text-gray-600">
                You have {10 - (user?.reportsGenerated || 0)} reports remaining
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {user?.reportsGenerated || 0}
            </div>
            <div className="text-sm text-gray-500">of 10</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(((user?.reportsGenerated || 0) / 10) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((user?.reportsGenerated || 0) / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Address Input Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Property Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter full property address (e.g., 123 Main St, City, State ZIP)"
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Generate ARV Report</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Last Report */}
      {lastReport && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Latest ARV Report</h3>
              <p className="text-sm text-gray-500">
                Generated {lastReport.generatedAt.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Property Address
              </label>
              <p className="text-lg font-medium text-gray-900">{lastReport.address}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estimated ARV
              </label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(lastReport.estimatedValue)}
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Note: This is a simplified demo
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  In a real application, this would generate a comprehensive ARV report with comparable sales, market analysis, and detailed property information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARVCalculator;