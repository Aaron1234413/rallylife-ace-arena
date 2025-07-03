
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { EnhancedStoreLayout } from '@/components/store/EnhancedStoreLayout';

const Store = () => {
  const { user } = useAuth();
  const { tokenData, transactions, loading, spendTokens, addTokens } = usePlayerTokens();
  const { restoreHP } = usePlayerHP();
  const { addXP } = usePlayerXP();

  // Handler functions for different item effects
  const handleAddXP = async (amount: number, source: string, description?: string) => {
    await addXP(amount, source, description);
  };

  const handleAddTokens = async (amount: number, source: string, description?: string) => {
    await addTokens(amount, 'regular', source, description);
  };

  const handleLevelBoost = async (source: string, description?: string) => {
    // Level boost gives enough XP to reach next level
    // For now, we'll give a large XP amount - this can be refined later
    await addXP(1000, source, description);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <EnhancedStoreLayout
          tokenData={tokenData}
          onSpendTokens={spendTokens}
          onRestoreHP={restoreHP}
          onAddXP={handleAddXP}
          onAddTokens={handleAddTokens}
          onLevelBoost={handleLevelBoost}
        />
      </div>
    </div>
  );
};

export default Store;
