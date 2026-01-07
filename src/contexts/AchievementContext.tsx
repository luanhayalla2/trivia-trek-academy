import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface AchievementContextType {
  pendingAchievement: Achievement | null;
  showAchievement: (achievement: Achievement) => void;
  clearAchievement: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);

  const showAchievement = useCallback((achievement: Achievement) => {
    setPendingAchievement(achievement);
  }, []);

  const clearAchievement = useCallback(() => {
    setPendingAchievement(null);
  }, []);

  return (
    <AchievementContext.Provider value={{ pendingAchievement, showAchievement, clearAchievement }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievementContext = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
};
