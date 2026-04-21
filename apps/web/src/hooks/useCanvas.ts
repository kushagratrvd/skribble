import { useRef, useEffect, useCallback, useState } from 'react';
import { getSocket } from '../socket/index';
import { emitDrawStart, emitDrawMove, emitDrawEnd } from '../socket/events';
import type { DrawStroke, DrawPoint } from '@skribbl/shared';

interface UseCanvasOptions {
  isDrawer: boolean;
  width: number;
  height: number;
}

export function useCanvas({ isDrawer, width, height }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  const strokesRef = useRef<DrawStroke[]>([]);
  const currentStrokeRef = useRef<DrawStroke | null>(null);

  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const getCanvasPoint = useCallback(
    (e: MouseEvent | TouchEvent): DrawPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number, clientY: number;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const drawLineSegment = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      from: DrawPoint,
      to: DrawPoint,
      strokeColor: string,
      strokeSize: number,
      strokeTool: 'brush' | 'eraser'
    ) => {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = strokeTool === 'eraser' ? '#FFFFFF' : strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation =
        strokeTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    },
    []
  );

  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: DrawStroke) => {
      if (stroke.points.length < 2) {
        // Single dot
        if (stroke.points.length === 1) {
          ctx.beginPath();
          ctx.arc(
            stroke.points[0].x,
            stroke.points[0].y,
            stroke.size / 2,
            0,
            Math.PI * 2
          );
          ctx.fillStyle =
            stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
          if (stroke.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
          }
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        return;
      }
      for (let i = 1; i < stroke.points.length; i++) {
        drawLineSegment(
          ctx,
          stroke.points[i - 1],
          stroke.points[i],
          stroke.color,
          stroke.size,
          stroke.tool
        );
      }
    },
    [drawLineSegment]
  );

  const redrawAll = useCallback(
    (strokes: DrawStroke[]) => {
      const ctx = getContext();
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      for (const stroke of strokes) {
        drawStroke(ctx, stroke);
      }
    },
    [getContext, drawStroke, width, height]
  );

  const clearCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    strokesRef.current = [];
  }, [getContext, width, height]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }
  }, [width, height]);

  // Handle drawer mouse/touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawer) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const point = getCanvasPoint(e);
      if (!point) return;

      setIsDrawing(true);
      currentStrokeRef.current = {
        points: [point],
        color,
        size: brushSize,
        tool,
      };

      emitDrawStart({
        x: point.x,
        y: point.y,
        color,
        size: brushSize,
        tool,
      });
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!currentStrokeRef.current) return;

      const point = getCanvasPoint(e);
      if (!point) return;

      const ctx = getContext();
      if (!ctx) return;

      const lastPoint =
        currentStrokeRef.current.points[
          currentStrokeRef.current.points.length - 1
        ];

      drawLineSegment(
        ctx,
        lastPoint,
        point,
        currentStrokeRef.current.color,
        currentStrokeRef.current.size,
        currentStrokeRef.current.tool
      );

      currentStrokeRef.current.points.push(point);
      emitDrawMove({ x: point.x, y: point.y });
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!currentStrokeRef.current) return;

      strokesRef.current.push(currentStrokeRef.current);
      currentStrokeRef.current = null;
      setIsDrawing(false);
      emitDrawEnd();
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, [isDrawer, color, brushSize, tool, getCanvasPoint, getContext, drawLineSegment]);

  // Handle remote drawing events (non-drawer)
  useEffect(() => {
    if (isDrawer) return;

    const socket = getSocket();
    const remoteStrokeRef: { current: DrawStroke | null } = { current: null };

    const handleRemoteStart = (data: {
      x: number;
      y: number;
      color: string;
      size: number;
      tool: 'brush' | 'eraser';
    }) => {
      remoteStrokeRef.current = {
        points: [{ x: data.x, y: data.y }],
        color: data.color,
        size: data.size,
        tool: data.tool,
      };
    };

    const handleRemoteMove = (data: { x: number; y: number }) => {
      if (!remoteStrokeRef.current) return;

      const ctx = getContext();
      if (!ctx) return;

      const lastPoint =
        remoteStrokeRef.current.points[
          remoteStrokeRef.current.points.length - 1
        ];

      drawLineSegment(
        ctx,
        lastPoint,
        { x: data.x, y: data.y },
        remoteStrokeRef.current.color,
        remoteStrokeRef.current.size,
        remoteStrokeRef.current.tool
      );

      remoteStrokeRef.current.points.push({ x: data.x, y: data.y });
    };

    const handleRemoteEnd = () => {
      if (remoteStrokeRef.current) {
        strokesRef.current.push(remoteStrokeRef.current);
        remoteStrokeRef.current = null;
      }
    };

    const handleClear = () => {
      clearCanvas();
    };

    const handleUndo = (data: { strokes: DrawStroke[] }) => {
      strokesRef.current = data.strokes;
      redrawAll(data.strokes);
    };

    socket.on('draw_start', handleRemoteStart);
    socket.on('draw_move', handleRemoteMove);
    socket.on('draw_end', handleRemoteEnd);
    socket.on('canvas_clear', handleClear);
    socket.on('draw_undo', handleUndo);

    return () => {
      socket.off('draw_start', handleRemoteStart);
      socket.off('draw_move', handleRemoteMove);
      socket.off('draw_end', handleRemoteEnd);
      socket.off('canvas_clear', handleClear);
      socket.off('draw_undo', handleUndo);
    };
  }, [isDrawer, getContext, drawLineSegment, clearCanvas, redrawAll]);

  return {
    canvasRef,
    isDrawing,
    color,
    setColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    clearCanvas,
    strokesRef,
    redrawAll,
  };
}