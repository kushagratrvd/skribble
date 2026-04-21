import { AvatarState } from '@skribbl/shared';

export const ATLAS_CONFIG = {
  color: { url: '/avatars/color_atlas.gif', cols: 10, rows: 10, max: 28 },
  eyes:  { url: '/avatars/eyes_atlas.gif',  cols: 10, rows: 10, max: 57 },
  mouth: { url: '/avatars/mouth_atlas.gif', cols: 10, rows: 10, max: 51 },
}

export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  images: Record<string, HTMLImageElement>,
  avatar: AvatarState,
  size = 120
) {
  for (const [key, cfg] of Object.entries(ATLAS_CONFIG)) {
    const img = images[key]
    if (!img) continue
    const spriteW = img.width / cfg.cols
    const spriteH = img.height / cfg.rows
    const idx = avatar[key as keyof AvatarState]
    const col = idx % cfg.cols
    const row = Math.floor(idx / cfg.cols)
    ctx.drawImage(img, col * spriteW, row * spriteH, spriteW, spriteH, 0, 0, size, size)
  }
}