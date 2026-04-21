import type { PlayerData, AvatarState } from '@skribbl/shared';

export class Player {
  public id: string;
  public socketId: string;
  public name: string;
  public score: number;
  public isDrawing: boolean;
  public hasGuessed: boolean;
  public avatar: AvatarState;
  public isHost: boolean;
  public disconnectedAt: number | null;

  constructor(
    id: string,
    socketId: string,
    name: string,
    avatar: AvatarState,
    isHost: boolean
  ) {
    this.id = id;
    this.socketId = socketId;
    this.name = name;
    this.score = 0;
    this.isDrawing = false;
    this.hasGuessed = false;
    this.avatar = avatar;
    this.isHost = isHost;
    this.disconnectedAt = null;
  }

  addScore(points: number): void {
    this.score += points;
  }

  reset(): void {
    this.score = 0;
    this.isDrawing = false;
    this.hasGuessed = false;
  }

  toData(): PlayerData {
    return {
      id: this.id,
      socketId: this.socketId,
      name: this.name,
      score: this.score,
      isDrawing: this.isDrawing,
      hasGuessed: this.hasGuessed,
      avatar: this.avatar,
      isHost: this.isHost,
    };
  }
}