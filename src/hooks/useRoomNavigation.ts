import { useState } from 'react';

export type RoomType = 'living' | 'kitchen' | 'bathroom' | 'game' | 'bedroom' | 'shop';

export const useRoomNavigation = () => {
  const [currentRoom, setCurrentRoom] = useState<RoomType>('living');

  const navigateToRoom = (room: RoomType) => {
    setCurrentRoom(room);
  };

  return {
    currentRoom,
    navigateToRoom,
  };
};