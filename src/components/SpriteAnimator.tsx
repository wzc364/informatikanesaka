/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../utils';

export type SpriteDirection = 0 | 1 | 2 | 3; // 0: right, 1: down, 2: left, 3: up

interface SpriteAnimatorProps {
  spriteSheetSrc: string;
  direction?: SpriteDirection;
  isMoving?: boolean;
  actionPose?: string;
  frameWidth?: number;
  frameHeight?: number;
  columns?: number;
  rows?: number;
  scale?: number;
  fps?: number;
  className?: string;
  altText?: string;
}

export const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  spriteSheetSrc,
  direction = 1,
  isMoving = false,
  actionPose = 'idle',
  frameWidth = 16,
  frameHeight = 16,
  columns = 4,
  rows = 4,
  scale = 3,
  fps = 8,
  className,
  altText = 'Character Sprite',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spriteSheetSrc;
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => {
      setImgLoaded(false);
    };
  }, [spriteSheetSrc]);

  const renderSprite = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || !imgLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let row = direction;
    if (direction === 2) row = 0;

    let col = 0;
    if (isMoving) {
      col = currentFrameRef.current % Math.min(columns, 4);
    } else if (actionPose !== 'idle') {
      col = 1;
    } else {
      col = 0;
    }

    const srcX = col * frameWidth;
    const srcY = row * frameHeight;

    ctx.save();
    if (direction === 2) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      imgRef.current,
      srcX,
      srcY,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth * scale,
      frameHeight * scale
    );
    ctx.restore();
  }, [direction, isMoving, actionPose, frameWidth, frameHeight, columns, scale, imgLoaded]);

  useEffect(() => {
    let active = true;
    const interval = 1000 / fps;

    const loop = (timestamp: number) => {
      if (!active) return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= interval) {
        lastTimeRef.current = timestamp - (elapsed % interval);
        if (isMoving) {
          currentFrameRef.current = (currentFrameRef.current + 1) % columns;
        } else {
          currentFrameRef.current = 0;
        }
        renderSprite();
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isMoving, fps, columns, renderSprite]);

  return (
    <div className={cn('inline-block relative overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        width={frameWidth * scale}
        height={frameHeight * scale}
        style={{ imageRendering: 'pixelated' }}
        aria-label={altText}
        role="img"
      />
    </div>
  );
};

export default SpriteAnimator;
