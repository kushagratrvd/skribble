export const SOCKET_EVENTS = {
  // Room
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  UPDATE_SETTINGS: 'update_settings',
  SETTINGS_UPDATED: 'settings_updated',
  START_GAME: 'start_game',

  // Game
  GAME_STARTING: 'game_starting',
  CHOOSE_WORD: 'choose_word',
  WORD_CHOSEN: 'word_chosen',
  ROUND_START: 'round_start',
  TIMER_TICK: 'timer_tick',
  HINT_REVEAL: 'hint_reveal',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
  GAME_STATE: 'game_state',

  // Drawing
  DRAW_START: 'draw_start',
  DRAW_MOVE: 'draw_move',
  DRAW_END: 'draw_end',
  CANVAS_CLEAR: 'canvas_clear',
  DRAW_UNDO: 'draw_undo',

  // Chat
  GUESS: 'guess',
  CHAT: 'chat',
  CHAT_MESSAGE: 'chat_message',
  GUESS_RESULT: 'guess_result',

  // Misc
  REQUEST_GAME_STATE: 'request_game_state',
  ERROR_MESSAGE: 'error_message',
} as const;