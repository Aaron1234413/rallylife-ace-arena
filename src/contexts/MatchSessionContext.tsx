
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TennisScore {
  playerSets: number;
  opponentSets: number;
  playerGames: number;
  opponentGames: number;
  playerPoints: number; // 0, 15, 30, 40, or special cases like deuce
  opponentPoints: number;
  isDeuce: boolean;
  playerAdvantage: boolean;
  opponentAdvantage: boolean;
}

interface MatchSessionData {
  // Start match data
  opponentName: string;
  isDoubles: boolean;
  partnerName?: string;
  opponent1Name?: string;
  opponent2Name?: string;
  matchType: 'singles' | 'doubles';
  startTime: Date;
  
  // Tennis scoring
  score?: TennisScore;
  
  // Mid-match check-in data
  midMatchMood?: string;
  midMatchNotes?: string;
  
  // End match data
  finalScore?: string;
  duration?: number;
  endMood?: string;
  matchNotes?: string;
  result?: 'win' | 'loss';
}

interface MatchSessionContextType {
  sessionData: MatchSessionData | null;
  updateSessionData: (data: Partial<MatchSessionData>) => void;
  updateScore: (playerScored: boolean) => void;
  clearSession: () => void;
  isSessionActive: boolean;
}

const MatchSessionContext = createContext<MatchSessionContextType | undefined>(undefined);

export const useMatchSession = () => {
  const context = useContext(MatchSessionContext);
  if (context === undefined) {
    throw new Error('useMatchSession must be used within a MatchSessionProvider');
  }
  return context;
};

interface MatchSessionProviderProps {
  children: ReactNode;
}

export const MatchSessionProvider: React.FC<MatchSessionProviderProps> = ({ children }) => {
  const [sessionData, setSessionData] = useState<MatchSessionData | null>(null);

  const updateSessionData = (data: Partial<MatchSessionData>) => {
    setSessionData(prev => {
      if (!prev) {
        // Initialize with default score if starting a new session
        const newData = data as MatchSessionData;
        if (!newData.score) {
          newData.score = {
            playerSets: 0,
            opponentSets: 0,
            playerGames: 0,
            opponentGames: 0,
            playerPoints: 0,
            opponentPoints: 0,
            isDeuce: false,
            playerAdvantage: false,
            opponentAdvantage: false
          };
        }
        return newData;
      }
      return { ...prev, ...data };
    });
  };

  const updateScore = (playerScored: boolean) => {
    setSessionData(prev => {
      if (!prev || !prev.score) return prev;
      
      const newScore = { ...prev.score };
      
      if (playerScored) {
        // Player scored
        if (newScore.opponentAdvantage) {
          // Reset to deuce
          newScore.opponentAdvantage = false;
          newScore.isDeuce = true;
        } else if (newScore.isDeuce) {
          // Player gets advantage
          newScore.isDeuce = false;
          newScore.playerAdvantage = true;
        } else if (newScore.playerAdvantage) {
          // Player wins game
          newScore.playerGames++;
          newScore.playerPoints = 0;
          newScore.opponentPoints = 0;
          newScore.playerAdvantage = false;
          newScore.isDeuce = false;
          
          // Check if player wins set (simplified - 6 games wins)
          if (newScore.playerGames >= 6 && newScore.playerGames - newScore.opponentGames >= 2) {
            newScore.playerSets++;
            newScore.playerGames = 0;
            newScore.opponentGames = 0;
          }
        } else {
          // Normal point progression
          if (newScore.playerPoints === 0) newScore.playerPoints = 15;
          else if (newScore.playerPoints === 15) newScore.playerPoints = 30;
          else if (newScore.playerPoints === 30) newScore.playerPoints = 40;
          else if (newScore.playerPoints === 40) {
            if (newScore.opponentPoints === 40) {
              newScore.isDeuce = true;
            } else {
              // Player wins game
              newScore.playerGames++;
              newScore.playerPoints = 0;
              newScore.opponentPoints = 0;
              
              // Check if player wins set
              if (newScore.playerGames >= 6 && newScore.playerGames - newScore.opponentGames >= 2) {
                newScore.playerSets++;
                newScore.playerGames = 0;
                newScore.opponentGames = 0;
              }
            }
          }
        }
      } else {
        // Opponent scored (mirror logic)
        if (newScore.playerAdvantage) {
          newScore.playerAdvantage = false;
          newScore.isDeuce = true;
        } else if (newScore.isDeuce) {
          newScore.isDeuce = false;
          newScore.opponentAdvantage = true;
        } else if (newScore.opponentAdvantage) {
          newScore.opponentGames++;
          newScore.playerPoints = 0;
          newScore.opponentPoints = 0;
          newScore.opponentAdvantage = false;
          newScore.isDeuce = false;
          
          if (newScore.opponentGames >= 6 && newScore.opponentGames - newScore.playerGames >= 2) {
            newScore.opponentSets++;
            newScore.playerGames = 0;
            newScore.opponentGames = 0;
          }
        } else {
          if (newScore.opponentPoints === 0) newScore.opponentPoints = 15;
          else if (newScore.opponentPoints === 15) newScore.opponentPoints = 30;
          else if (newScore.opponentPoints === 30) newScore.opponentPoints = 40;
          else if (newScore.opponentPoints === 40) {
            if (newScore.playerPoints === 40) {
              newScore.isDeuce = true;
            } else {
              newScore.opponentGames++;
              newScore.playerPoints = 0;
              newScore.opponentPoints = 0;
              
              if (newScore.opponentGames >= 6 && newScore.opponentGames - newScore.playerGames >= 2) {
                newScore.opponentSets++;
                newScore.playerGames = 0;
                newScore.opponentGames = 0;
              }
            }
          }
        }
      }
      
      return { ...prev, score: newScore };
    });
  };

  const clearSession = () => {
    setSessionData(null);
  };

  const isSessionActive = sessionData !== null;

  return (
    <MatchSessionContext.Provider 
      value={{ 
        sessionData, 
        updateSessionData, 
        updateScore,
        clearSession, 
        isSessionActive 
      }}
    >
      {children}
    </MatchSessionContext.Provider>
  );
};
