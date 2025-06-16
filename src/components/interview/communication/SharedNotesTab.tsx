import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SharedNotesPanel } from '@/components/interview/SharedNotesPanel';

interface SharedNotesTabProps {
  onUnreadChange: (count: number) => void;
}

export const SharedNotesTab: React.FC<SharedNotesTabProps> = ({ onUnreadChange }) => {
  // Get the roomId from URL parameters
  const { roomId = 'default-room' } = useParams();
  
  // Reset unread count when component mounts
  useEffect(() => {
    onUnreadChange(0);
  }, [onUnreadChange]);

  return (
    <div className="h-full">
      <SharedNotesPanel roomId={roomId} />
    </div>
  );
};
