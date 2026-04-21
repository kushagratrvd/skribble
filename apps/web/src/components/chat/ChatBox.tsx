import { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { classNames } from '../../lib/utils';

export default function ChatBox() {
  const messages = useGameStore((s) => s.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{ paddingTop: '0.2em', color: '#000', backgroundColor: '#fff', borderRadius: '3px' }}
    >
      {messages.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">
          No messages yet...
        </p>
      )}
      {messages.map((msg, idx) => (
        <p
          key={msg.id}
          className={classNames(
            'animate-chat-msg text-sm px-2 py-0.5 m-0',
            msg.isCorrectGuess ? '' : ''
          )}
          style={{
            backgroundColor: msg.isCorrectGuess
              ? (idx % 2 === 0 ? '#e7ffdf' : '#cfffbd')
              : (idx % 2 === 0 ? '#fff' : '#ececec'),
            color: msg.isSystem && msg.isCorrectGuess
              ? '#56CE27'
              : msg.isSystem && msg.text.includes('joined')
              ? '#56CE27'
              : msg.isSystem && msg.text.includes('left')
              ? '#CE4F0A'
              : msg.isSystem
              ? '#3975CE'
              : '#000',
          }}
        >
          {!msg.isSystem && (
            <b style={{ marginRight: '0.3em' }}>
              {msg.playerName}:
            </b>
          )}
          <span>{msg.text}</span>
        </p>
      ))}
    </div>
  );
}