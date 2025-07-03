
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { EnhancedStoreLayout } from '@/components/store/EnhancedStoreLayout';

const Store = () => {
  const { user } = useAuth();
  const { tokenData, transactions, loading, spendTokens } = usePlayerTokens();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <EnhancedStoreLayout
          tokenData={tokenData}
          onSpendTokens={spendTokens}
        />
      </div>
    </div>
  );
};

export default Store;
