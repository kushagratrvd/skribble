import { getSocket } from './index';
import type { RoomSettings, DrawStartPayload, DrawMovePayload, AvatarState } from '@skribbl/shared';

export function emitCreateRoom(
  playerName: string,
  avatar: AvatarState,
  settings: Partial<RoomSettings>
): void {
  getSocket().emit('create_room', { playerName, avatar, settings });
}

export function emitJoinRoom(
  code: string,
  playerName: string,
  avatar: AvatarState
): void {
  getSocket().emit('join_room', { code, playerName, avatar });
}

export function emitLeaveRoom(): void {
  getSocket().emit('leave_room');
}

export function emitUpdateSettings(settings: Partial<RoomSettings>): void {
  getSocket().emit('update_settings', { settings });
}

export function emitStartGame(): void {
  getSocket().emit('start_game');
}

export function emitWordChosen(word: string): void {
  getSocket().emit('word_chosen', { word });
}

export function emitDrawStart(data: DrawStartPayload): void {
  getSocket().emit('draw_start', data);
}

export function emitDrawMove(data: DrawMovePayload): void {
  getSocket().emit('draw_move', data);
}

export function emitDrawEnd(): void {
  getSocket().emit('draw_end');
}

export function emitCanvasClear(): void {
  getSocket().emit('canvas_clear');
}

export function emitDrawUndo(): void {
  getSocket().emit('draw_undo');
}

export function emitGuess(text: string): void {
  getSocket().emit('guess', { text });
}

export function emitChat(text: string): void {
  getSocket().emit('chat', { text });
}

export function emitRequestGameState(): void {
  getSocket().emit('request_game_state');
}

export function emitListRooms(): void {
  getSocket().emit('list_rooms');
}

export function emitGetLeaderboard(): void {
  getSocket().emit('get_leaderboard');
}

export function emitKickPlayer(playerId: string): void {
  getSocket().emit('kick_player', { playerId });
}