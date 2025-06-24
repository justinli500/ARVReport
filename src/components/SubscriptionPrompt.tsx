import React from 'react';
import { X, Check, Star, Zap } from 'lucide-react';

interface SubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Pro',
      price: 29,
      period: 'month',
      features: [
        'Unlimited ARV reports',
        'Advanced market analysis',
        'Comparable sales data',
        'Property history reports',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Premium',
      price: 79,
      period: 'month',
      features: [
        'Everything in Pro',
        'Rental analysis tools',
        'Cash flow calculations',
        'Portfolio tracking',
        'Priority phone support',
        'Custom report branding',
      ],
      popular: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-xl mx-auto mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Upgrade to Continue
            </h2>
            <p className="text-xl text-blue-100">
              You've reached your limit of 10 free reports. Choose a plan to continue analyzing properties.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border-2 p-8 ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-lg text-gray-500 ml-1">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Choose {plan.name}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-sm underline transition-colors"
            >
              I'll upgrade later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPrompt;
