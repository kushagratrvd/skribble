import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket, getSocket } from '../socket/index';
import { useGameStore } from '../store/gameStore';
import { playSound } from '../lib/sounds';

export function useSocket() {
  const navigate = useNavigate();
  const store = useGameStore();

  const setupListeners = useCallback(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      store.setConnected(true);
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      store.setConnected(false);
      console.log('[Socket] Disconnected');
    });

    socket.on('error_message', (data) => {
      toast.error(data.message);
    });

    socket.on('kicked_from_room', () => {
      toast.error('You were kicked by the host.');
      store.resetAll();
      navigate('/');
    });

    socket.on('room_created', (data) => {
      console.log('[Room] Created:', data.code);
    });

    socket.on('room_joined', (data) => {
      // Figure out which player we are
      const mySocketId = socket.id;
      const myPlayer = data.players.find((p) => p.socketId === mySocketId);

      if (myPlayer) {
        store.setMyInfo(myPlayer.id, myPlayer.name, myPlayer.avatar);
      }

      store.setRoom(
        data.roomId,
        data.code,
        data.players,
        data.settings,
        data.hostId
      );

      navigate(`/lobby/${data.code}`);
    });

    socket.on('player_joined', (data) => {
      store.addPlayer(data.player);
      playSound('join');
    });

    socket.on('player_left', (data) => {
      store.removePlayer(data.playerId, data.newHostId);
      playSound('leave');
    });

    socket.on('settings_updated', (data) => {
      store.updateSettings(data.settings);
    });

    socket.on('game_starting', () => {
      const roomCode = useGameStore.getState().roomCode;
      playSound('roundStart');
      navigate(`/game/${roomCode}`);
    });

    socket.on('choose_word', (data) => {
      store.setWordOptions(data.words);
      store.setPhase('choosing');
    });

    socket.on('round_start', (data) => {
      store.setGameState({
        phase: 'choosing',
        round: data.round,
        totalRounds: data.totalRounds,
        drawerId: data.drawerId,
        drawerName: data.drawerName,
        hints: data.hints,
        timeLeft: data.drawTime,
        turnIndex: data.turnIndex,
        totalTurns: data.totalTurns,
      });
      store.setStrokes([]);
      store.setCurrentWord('');

      // If I'm NOT the drawer, clear word options
      const state = useGameStore.getState();
      if (state.myId !== data.drawerId) {
        store.setWordOptions([]);
      }
    });

    socket.on('hint_reveal', (data) => {
      store.setHints(data.hints);
      // If I'm the drawer, hints is the full word
      const state = useGameStore.getState();
      if (state.myId === state.drawerId) {
        store.setCurrentWord(data.hints);
      }
      if (state.phase === 'choosing') {
        store.setPhase('drawing');
      }
    });

    socket.on('timer_tick', (data) => {
      store.setTimeLeft(data.timeLeft);
      if (data.timeLeft <= 10 && data.timeLeft > 0) {
        playSound('tick');
      }
    });

    socket.on('guess_result', (data) => {
      if (data.correct) {
        playSound('playerGuessed');
        // Update the specific player's score and hasGuessed
        const state = useGameStore.getState();
        const updatedPlayers = state.players.map((p) =>
          p.id === data.playerId
            ? { ...p, hasGuessed: true, score: p.score + data.points }
            : p
        );
        store.updatePlayers(updatedPlayers);
      }
    });

    socket.on('round_end', (data) => {
      store.setPhase('round_end');
      store.setRoundEndWord(data.word);
      store.updatePlayers(data.players);
      // Play success if we guessed, failure otherwise
      const myId = useGameStore.getState().myId;
      const myPlayer = data.players.find((p: any) => p.id === myId);
      playSound(myPlayer?.hasGuessed ? 'roundEndSuccess' : 'roundEndFailure');
    });

    socket.on('game_over', (data) => {
      store.setPhase('game_over');
      store.updatePlayers(data.leaderboard);
    });

    socket.on('chat_message', (data) => {
      store.addMessage(data);
    });

    socket.on('draw_start', (data) => {
      // Handled in useCanvas
    });

    socket.on('draw_move', (data) => {
      // Handled in useCanvas
    });

    socket.on('draw_end', () => {
      // Handled in useCanvas
    });

    socket.on('canvas_clear', () => {
      store.setStrokes([]);
    });

    socket.on('draw_undo', (data) => {
      store.setStrokes(data.strokes);
    });

    socket.on('game_state', (data) => {
      store.setGameState({
        phase: data.phase,
        round: data.round,
        totalRounds: data.totalRounds,
        drawerId: data.drawerId,
        drawerName: data.drawerName,
        hints: data.hints,
        timeLeft: data.timeLeft,
        turnIndex: data.turnIndex,
        totalTurns: data.totalTurns,
      });
      store.updatePlayers(data.players);
      store.updateSettings(data.settings);
      store.setMessages(data.messages);
      store.setStrokes(data.strokes);

      if (data.hostId) {
        // We need to set hostId in the store
        useGameStore.setState({ hostId: data.hostId });
      }
    });

    return socket;
  }, [navigate]);

  useEffect(() => {
    const socket = connectSocket();
    setupListeners();

    return () => {
      socket.removeAllListeners();
    };
  }, [setupListeners]);

  return getSocket();
}