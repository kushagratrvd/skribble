import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export function useGameState() {
  const navigate = useNavigate();
  const roomCode = useGameStore((s) => s.roomCode);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    // If no room info, redirect to home
    if (!roomCode) {
      navigate('/');
    }
  }, [roomCode, navigate]);

  return { phase, roomCode };
}