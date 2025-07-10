import { useClubs } from './useClubs';

export function useClub() {
  const { 
    myClubs, 
    joinClub, 
    leaveClub, 
    createClub 
  } = useClubs();

  // Return the first club user is a member of, or null
  const club = myClubs.length > 0 ? myClubs[0] : null;

  return {
    club,
    joinClub,
    leaveClub,
    createClub
  };
}