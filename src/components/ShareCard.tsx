'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface ShareCardProps {
  brainAge: number;
  category: string;
  description: string;
  scores: {
    memory: number;
    reasoning: number;
    zip: number;
    patches: number;
  };
  onCardGenerated?: (dataUrl: string) => void;
}

export default function ShareCard({ brainAge, category, description, scores, onCardGenerated }: ShareCardProps) {
  const { trackEvent } = useAnalytics();
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the Matiks logo
    const logoImg = new Image();
    logoImg.onload = () => {
      // Set high-res canvas sizes (9:16 Story aspect ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      // 1. Draw Background (Clean black)
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Matiks Logo (top center)
      const logoWidth = 120;
      const logoHeight = 60;
      ctx.drawImage(logoImg, (canvas.width - logoWidth) / 2, 80, logoWidth, logoHeight);

      // 3. Header Texts
      ctx.fillStyle = '#B1FA63';
      ctx.font = '600 36px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MATIKS', canvas.width / 2, 190);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 64px system-ui, -apple-system, sans-serif';
      ctx.fillText('HOW YOUNG IS YOUR BRAIN?', canvas.width / 2, 290);

      // 4. Draw Brain Age Circle Badge
      const badgeX = canvas.width / 2;
      const badgeY = 520;
      const badgeRadius = 180;

      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#B1FA63';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 160px system-ui, -apple-system, sans-serif';
      ctx.fillText(brainAge.toString(), badgeX, badgeY + 25);

      ctx.fillStyle = '#888888';
      ctx.font = '500 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('BRAIN AGE', badgeX, badgeY + 85);

      // 5. Category Title
      ctx.fillStyle = '#B1FA63';
      ctx.font = '800 60px system-ui, -apple-system, sans-serif';
      ctx.fillText(category.toUpperCase(), canvas.width / 2, 800);

      // 6. Description
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '400 36px system-ui, -apple-system, sans-serif';
      
      const words = description.split(' ');
      let line1 = '';
      let line2 = '';
      let index = 0;
      while (index < words.length) {
        if ((line1 + words[index]).length < 35) {
          line1 += words[index] + ' ';
        } else {
          line2 += words[index] + ' ';
        }
        index++;
      }
      ctx.fillText(line1.trim(), canvas.width / 2, 890);
      if (line2 !== '') {
        ctx.fillText(line2.trim(), canvas.width / 2, 940);
      }

      // 7. Draw Metrics Box
      const boxX = 140;
      const boxY = line2 !== '' ? 1020 : 980;
      const boxW = 800;
      const boxH = 460;
      
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(boxX, boxY, boxW, boxH, 16) : ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();

      ctx.fillStyle = '#666666';
      ctx.font = '600 26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('COGNITIVE DIMENSION', boxX + 50, boxY + 60);

      const drawProgressBar = (label: string, score: number, yOffset: number, color: string) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 30px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, boxX + 50, boxY + yOffset);

        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(boxX + 50, boxY + yOffset + 18, 680, 14, 7) : ctx.rect(boxX + 50, boxY + yOffset + 18, 680, 14);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(boxX + 50, boxY + yOffset + 18, (680 * score) / 100, 14, 7) : ctx.rect(boxX + 50, boxY + yOffset + 18, (680 * score) / 100, 14);
        ctx.fill();
      };

      drawProgressBar('MEMORY', scores.memory, 140, '#B1FA63');
      drawProgressBar('REASONING', scores.reasoning, 230, '#B1FA63');
      drawProgressBar('ZIP', scores.zip, 320, '#B1FA63');
      drawProgressBar('PATCHES', scores.patches, 410, '#B1FA63');

      // 8. CTA Footer
      ctx.fillStyle = '#B1FA63';
      ctx.font = '700 42px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CAN YOU BEAT ME?', canvas.width / 2, boxY + boxH + 80);

      ctx.fillStyle = '#888888';
      ctx.font = '400 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('Think you\'re faster? Prove it.', canvas.width / 2, boxY + boxH + 130);

      // Convert Canvas to PNG image data URL
      const dataUrl = canvas.toDataURL('image/png');
      setImgDataUrl(dataUrl);

      if (onCardGenerated) {
        onCardGenerated(dataUrl);
      }
    };
    logoImg.src = '/matiks-logo.svg';
  }, [brainAge, category, description, scores, onCardGenerated]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hidden high-res canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Rendered image preview (user-saveable on mobile!) */}
      {imgDataUrl ? (
        <img
          src={imgDataUrl}
          alt="Matiks Brain Age Result Card"
          className="w-full max-w-[240px] aspect-[9/16] rounded-2xl border border-gray-800 shadow-2xl scale-100 transition-transform active:scale-[0.98]"
        />
      ) : (
        <div className="w-[240px] aspect-[9/16] rounded-2xl bg-[#161920] border border-gray-800 flex flex-col justify-center items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#FF2A54] animate-spin" />
          <span className="text-[10px] text-gray-500 font-mono">Drawing Card...</span>
        </div>
      )}
    </div>
  );
}
