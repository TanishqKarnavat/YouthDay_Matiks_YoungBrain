'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import { Share2, Download, Trophy, Check } from 'lucide-react';

interface ShareButtonsProps {
  cardDataUrl: string | null;
  brainAge: number;
  message: string;
}

export default function ShareButtons({ cardDataUrl, brainAge, message }: ShareButtonsProps) {
  const { trackEvent } = useAnalytics();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://brainage.matiks.com';
  const shareText = `🧠 My brain age is ${brainAge}.\n${message}\n\nThink your brain is younger?\n${shareUrl}`;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Convert base64 dataUrl to File object for native file sharing
  const getCardFile = async (): Promise<File | null> => {
    if (!cardDataUrl) return null;
    try {
      const response = await fetch(cardDataUrl);
      const blob = await response.blob();
      return new File([blob], `matiks_brain_age_${brainAge}.png`, { type: 'image/png' });
    } catch (e) {
      console.error('Error parsing card image file:', e);
      return null;
    }
  };

  const handleShare = async () => {
    trackEvent('result_shared');
    
    const file = await getCardFile();
    const shareData: ShareData = {
      title: 'Matiks Brain Showdown',
      text: `${shareText} ${shareUrl}`,
      url: shareUrl,
    };

    // If Web Share API is available and supports files, try sharing the image file!
    if (navigator.share) {
      try {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            ...shareData,
            files: [file],
          });
          triggerToast('Result shared successfully!');
          return;
        }
        
        // Fallback to text sharing
        await navigator.share(shareData);
        triggerToast('Result shared successfully!');
      } catch (err) {
        // User cancelled share or error occurred
        if ((err as Error).name !== 'AbortError') {
          handleClipboardFallback();
        }
      }
    } else {
      handleClipboardFallback();
    }
  };

  const handleClipboardFallback = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    triggerToast('Share text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!cardDataUrl) return;
    trackEvent('result_downloaded');
    
    const link = document.createElement('a');
    link.href = cardDataUrl;
    link.download = `matiks_brain_age_${brainAge}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Result downloaded successfully!');
  };

  const handleChallengeFriend = () => {
    trackEvent('challenge_clicked');
    const text = `🧠 I challenge you! My brain age is ${brainAge}. ${message} Can you beat me? Play here: ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerToast('Challenge copied! Send to a friend.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[280px] mx-auto space-y-3 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#B1FA63] text-black text-xs font-mono font-bold rounded-lg z-50 pointer-events-none text-center whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleShare}
        className="w-full py-4 px-5 bg-[#B1FA63] hover:bg-[#9EE555] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 tracking-wider transition-all cursor-pointer outline-none uppercase"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        {copied ? 'Copied Link!' : 'Share Result'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          disabled={!cardDataUrl}
          className="py-3 px-4 bg-[#111111] hover:bg-[#1A1A1A] border border-gray-800 disabled:opacity-40 text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer outline-none transition-all"
        >
          <Download className="w-4 h-4" /> Save Card
        </button>

        <button
          onClick={handleChallengeFriend}
          className="py-3 px-4 bg-[#111111] hover:bg-[#1A1A1A] border border-gray-800 text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer outline-none transition-all"
        >
          <Trophy className="w-4 h-4" /> Share Challenge
        </button>
      </div>
    </div>
  );
}
