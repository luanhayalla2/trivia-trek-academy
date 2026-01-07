import { useAchievementContext } from '@/contexts/AchievementContext';
import { useGameAchievements } from '@/hooks/useGameAchievements';
import AchievementNotification from './AchievementNotification';

export const GlobalAchievementNotification = () => {
  const { pendingAchievement, clearAchievement } = useAchievementContext();
  const { newAchievement, clearNewAchievement } = useGameAchievements();

  const activeAchievement = pendingAchievement || newAchievement;

  const handleClose = () => {
    clearAchievement();
    clearNewAchievement();
  };

  return (
    <AchievementNotification 
      achievement={activeAchievement} 
      onClose={handleClose} 
    />
  );
};
