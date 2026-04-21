export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function generateAvatarColor(index: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85929E', '#73C6B6', '#E59866',
  ];
  return colors[index % colors.length];
}

export function getAvatarEmoji(index: number): string {
  const emojis = [
    '😀', '😎', '🤠', '🥳', '😺', '🐶', '🦊', '🐸',
    '🐵', '🦁', '🐯', '🐻', '🐼', '🐨', '🐷', '🐙',
  ];
  return emojis[index % emojis.length];
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}