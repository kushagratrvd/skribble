import type { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  DrawStroke,
  ChatMessage,
  GamePhase,
} from '@skribbl/shared';
import { getRandomWords } from '@skribbl/shared';
import { Player } from './Player.js';
import type { Room } from './Room.js';
import { nanoid } from 'nanoid';
import { HistoryManager } from './HistoryManager.js';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

export class Game {
  public room: Room;
  public io: TypedIO;
  public totalRounds: number;
  public currentRound: number;
  public drawerIndex: number;
  public currentWord: string;
  public drawTime: number;
  public timeLeft: number;
  public phase: GamePhase;
  public timer: ReturnType<typeof setInterval> | null;
  public hintTimer: ReturnType<typeof setInterval> | null;
  public strokes: DrawStroke[];
  public currentStroke: DrawStroke | null;
  public usedWords: string[];
  public turnOrder: string[];
  public turnIndex: number;
  public guessedCount: number;
  public messages: ChatMessage[];

  private hintIndices: Set<number>;
  private hintsRevealed: number;

  constructor(room: Room, io: TypedIO) {
    this.room = room;
    this.io = io;
    this.totalRounds = room.settings.totalRounds;
    this.currentRound = 0;
    this.drawerIndex = 0;
    this.currentWord = '';
    this.drawTime = room.settings.drawTime;
    this.timeLeft = 0;
    this.phase = 'waiting';
    this.timer = null;
    this.hintTimer = null;
    this.strokes = [];
    this.currentStroke = null;
    this.usedWords = [];
    this.turnOrder = [];
    this.turnIndex = 0;
    this.guessedCount = 0;
    this.messages = [];
    this.hintIndices = new Set();
    this.hintsRevealed = 0;
  }

  start(): void {
    this.currentRound = 1;
    this.turnIndex = 0;

    this.turnOrder = Array.from(this.room.players.keys());

    for (const player of this.room.players.values()) {
      player.reset();
    }

    this.io.to(this.room.id).emit('game_starting', { countdown: 3 });

    setTimeout(() => {
      this.nextTurn();
    }, 3000);
  }

  nextTurn(): void {
    if (this.turnIndex >= this.turnOrder.length) {
      this.turnIndex = 0;
      this.currentRound++;
    }

    if (this.currentRound > this.totalRounds) {
      this.end();
      return;
    }

    // Reset player states for this turn
    for (const player of this.room.players.values()) {
      player.isDrawing = false;
      player.hasGuessed = false;
    }

    // Find valid drawer
    let drawerId = this.turnOrder[this.turnIndex];
    let drawer = this.room.players.get(drawerId);

    // Skip disconnected players
    while (!drawer && this.turnIndex < this.turnOrder.length) {
      this.turnIndex++;
      if (this.turnIndex >= this.turnOrder.length) {
        this.turnIndex = 0;
        this.currentRound++;
        if (this.currentRound > this.totalRounds) {
          this.end();
          return;
        }
      }
      drawerId = this.turnOrder[this.turnIndex];
      drawer = this.room.players.get(drawerId);
    }

    if (!drawer) {
      this.end();
      return;
    }

    drawer.isDrawing = true;
    this.strokes = [];
    this.currentStroke = null;
    this.guessedCount = 0;
    this.hintIndices = new Set();
    this.hintsRevealed = 0;
    this.phase = 'choosing';

    // Get word options
    const allCustom = this.room.settings.customWords.filter(
      (w) => w.trim().length > 0
    );
    let wordOptions: string[];
    if (allCustom.length >= this.room.settings.wordCount) {
      wordOptions = [...allCustom]
        .sort(() => Math.random() - 0.5)
        .slice(0, this.room.settings.wordCount);
    } else {
      wordOptions = getRandomWords(
        this.room.settings.wordCount,
        this.usedWords
      );
    }

    // Notify drawer to choose
    const drawerSocket = this.io.sockets.sockets.get(drawer.socketId);
    if (drawerSocket) {
      drawerSocket.emit('choose_word', {
        words: wordOptions,
        drawTime: this.drawTime,
      });
    }

    // Notify all others that someone is choosing
    this.io.to(this.room.id).emit('round_start', {
      drawerId: drawer.id,
      drawerName: drawer.name,
      round: this.currentRound,
      totalRounds: this.totalRounds,
      turnIndex: this.turnIndex,
      totalTurns: this.turnOrder.length,
      hints: '',
      drawTime: this.drawTime,
    });

    // Auto-pick if drawer doesn't choose in 15 seconds
    const autoPickTimer = setTimeout(() => {
      if (this.phase === 'choosing') {
        this.chooseWord(
          wordOptions[Math.floor(Math.random() * wordOptions.length)]
        );
      }
    }, 15000);

    // Store reference to cancel if word chosen early
    this._autoPickTimer = autoPickTimer;
  }

  private _autoPickTimer: ReturnType<typeof setTimeout> | null = null;

  chooseWord(word: string): void {
    if (this._autoPickTimer) {
      clearTimeout(this._autoPickTimer);
      this._autoPickTimer = null;
    }

    this.currentWord = word.toLowerCase();
    this.usedWords.push(this.currentWord);
    this.phase = 'drawing';
    this.timeLeft = this.drawTime;

    const hints = this.generateHints();

    // Send hints to all guessers, full word to drawer
    for (const player of this.room.players.values()) {
      const sock = this.io.sockets.sockets.get(player.socketId);
      if (!sock) continue;

      if (player.isDrawing) {
        sock.emit('hint_reveal', { hints: this.currentWord });
      } else {
        sock.emit('hint_reveal', { hints });
      }
    }

    this.startTimer();
    this.startHintTimer();
  }

  private generateHints(): string {
    return this.currentWord
      .split('')
      .map((ch, i) => {
        if (ch === ' ') return '  ';
        if (this.hintIndices.has(i)) return ch;
        return '_';
      })
      .join(' ');
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.io.to(this.room.id).emit('timer_tick', { timeLeft: this.timeLeft });

      if (this.timeLeft <= 0) {
        this.endTurn();
      }
    }, 1000);
  }

  private startHintTimer(): void {
    if (!this.room.settings.hintsEnabled) return;

    const wordLetters: number[] = [];
    for (let i = 0; i < this.currentWord.length; i++) {
      if (this.currentWord[i] !== ' ') {
        wordLetters.push(i);
      }
    }

    const maxHints = Math.max(1, Math.floor(wordLetters.length * 0.4));
    const hintInterval = Math.floor((this.drawTime * 1000) / (maxHints + 1));

    this.hintTimer = setInterval(() => {
      if (this.hintsRevealed >= maxHints) {
        if (this.hintTimer) clearInterval(this.hintTimer);
        return;
      }

      // Pick a random unrevealed letter
      const unrevealed = wordLetters.filter((i) => !this.hintIndices.has(i));
      if (unrevealed.length === 0) {
        if (this.hintTimer) clearInterval(this.hintTimer);
        return;
      }

      const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      this.hintIndices.add(idx);
      this.hintsRevealed++;

      const hints = this.generateHints();

      for (const player of this.room.players.values()) {
        if (player.isDrawing) continue;
        const sock = this.io.sockets.sockets.get(player.socketId);
        if (sock) {
          sock.emit('hint_reveal', { hints });
        }
      }
    }, hintInterval);
  }

  checkGuess(playerId: string, guess: string): boolean {
    const normalized = guess.trim().toLowerCase();
    const player = this.room.players.get(playerId);

    if (!player || player.isDrawing || player.hasGuessed) return false;
    if (this.phase !== 'drawing') return false;

    if (normalized === this.currentWord.toLowerCase()) {
      player.hasGuessed = true;
      this.guessedCount++;

      // Score calculation: more time left = more points
      const maxPoints = 500;
      const minPoints = 50;
      const timeRatio = this.timeLeft / this.drawTime;
      const guesserPoints = Math.round(
        minPoints + (maxPoints - minPoints) * timeRatio
      );

      // Bonus for being first, second, etc.
      const orderBonus = Math.max(0, 100 - (this.guessedCount - 1) * 25);
      const totalPoints = guesserPoints + orderBonus;

      player.addScore(totalPoints);

      // Drawer gets points too
      const drawer = Array.from(this.room.players.values()).find(
        (p) => p.isDrawing
      );
      if (drawer) {
        drawer.addScore(Math.round(totalPoints * 0.3));
      }

      this.io.to(this.room.id).emit('guess_result', {
        correct: true,
        playerId: player.id,
        playerName: player.name,
        points: totalPoints,
      });

      const systemMsg: ChatMessage = {
        id: nanoid(8),
        playerId: 'system',
        playerName: 'System',
        text: `${player.name} guessed the word!`,
        isSystem: true,
        isCorrectGuess: true,
        timestamp: Date.now(),
      };
      this.messages.push(systemMsg);
      this.io.to(this.room.id).emit('chat_message', systemMsg);

      // Check if all non-drawing players have guessed
      const nonDrawers = Array.from(this.room.players.values()).filter(
        (p) => !p.isDrawing
      );
      const allGuessed = nonDrawers.every((p) => p.hasGuessed);

      if (allGuessed) {
        setTimeout(() => this.endTurn(), 1500);
      }

      return true;
    }

    // Check for close guess
    if (
      this.currentWord.length > 3 &&
      this.isCloseGuess(normalized, this.currentWord.toLowerCase())
    ) {
      const closeMsg: ChatMessage = {
        id: nanoid(8),
        playerId: 'system',
        playerName: 'System',
        text: `${player.name} is close!`,
        isSystem: true,
        isCorrectGuess: false,
        timestamp: Date.now(),
      };
      this.messages.push(closeMsg);
      this.io.to(this.room.id).emit('chat_message', closeMsg);
    }

    return false;
  }

  private isCloseGuess(guess: string, word: string): boolean {
    if (Math.abs(guess.length - word.length) > 2) return false;

    let distance = 0;
    const longer = guess.length > word.length ? guess : word;
    const shorter = guess.length > word.length ? word : guess;

    for (let i = 0; i < longer.length; i++) {
      if (shorter[i] !== longer[i]) distance++;
    }

    return distance <= 2 && distance > 0;
  }

  endTurn(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.hintTimer) {
      clearInterval(this.hintTimer);
      this.hintTimer = null;
    }
    if (this._autoPickTimer) {
      clearTimeout(this._autoPickTimer);
      this._autoPickTimer = null;
    }

    this.phase = 'round_end';

    const scores: Record<string, number> = {};
    const playersData = Array.from(this.room.players.values()).map((p) => {
      scores[p.id] = p.score;
      return p.toData();
    });

    this.io.to(this.room.id).emit('round_end', {
      word: this.currentWord,
      scores,
      players: playersData,
    });

    this.turnIndex++;

    setTimeout(() => {
      this.nextTurn();
    }, 5000);
  }

  end(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.hintTimer) clearInterval(this.hintTimer);
    if (this._autoPickTimer) clearTimeout(this._autoPickTimer);

    this.phase = 'game_over';

    const leaderboard = Array.from(this.room.players.values())
      .sort((a, b) => b.score - a.score)
      .map((p) => p.toData());

    const winner = leaderboard[0];

    this.io.to(this.room.id).emit('game_over', {
      winner,
      leaderboard,
    });

    // Persist game results
    HistoryManager.recordGame(this.room.code, leaderboard);
  }

  getHintsForPlayer(playerId: string): string {
    const player = this.room.players.get(playerId);
    if (!player) return '';
    if (player.isDrawing || player.hasGuessed) return this.currentWord;
    return this.generateHints();
  }

  cleanup(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.hintTimer) clearInterval(this.hintTimer);
    if (this._autoPickTimer) clearTimeout(this._autoPickTimer);
  }
}