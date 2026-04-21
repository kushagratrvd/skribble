import { db } from '../db/index.js';
import { gameHistory, leaderboard } from '../db/schema/index.js';
import { eq, sql } from 'drizzle-orm';
import type { PlayerData, GlobalLeaderboardEntry } from '@skribbl/shared';

export class HistoryManager {
  static async recordGame(roomCode: string, players: PlayerData[]) {
    if (players.length === 0) return;

    const winner = players.sort((a, b) => b.score - a.score)[0];

    try {
      // Record game history
      await db.insert(gameHistory).values({
        roomCode,
        winnerName: winner.name,
        winnerScore: winner.score,
        totalPlayers: players.length,
      });

      // Update global leaderboard
      for (const player of players) {
        const isWinner = player.id === winner.id;

        // Upsert logic for leaderboard
        const existing = await db
          .select()
          .from(leaderboard)
          .where(eq(leaderboard.playerName, player.name))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(leaderboard)
            .set({
              totalWins: isWinner ? existing[0].totalWins + 1 : existing[0].totalWins,
              totalScore: existing[0].totalScore + player.score,
              gamesPlayed: existing[0].gamesPlayed + 1,
              updatedAt: new Date(),
            })
            .where(eq(leaderboard.playerName, player.name));
        } else {
          await db.insert(leaderboard).values({
            playerName: player.name,
            totalWins: isWinner ? 1 : 0,
            totalScore: player.score,
            gamesPlayed: 1,
          });
        }
      }
    } catch (error) {
      console.error('[HistoryManager] Failed to record game:', error);
    }
  }

  static async getTopPlayers(limit: number = 10): Promise<GlobalLeaderboardEntry[]> {
    try {
       const results = await db
         .select({
           playerName: leaderboard.playerName,
           totalWins: leaderboard.totalWins,
           totalScore: leaderboard.totalScore,
           gamesPlayed: leaderboard.gamesPlayed,
         })
         .from(leaderboard)
         .orderBy(sql`${leaderboard.totalWins} DESC, ${leaderboard.totalScore} DESC`)
         .limit(limit);
       
       return results;
    } catch (error) {
      console.error('[HistoryManager] Failed to fetch leaderboard:', error);
      return [];
    }
  }
}
