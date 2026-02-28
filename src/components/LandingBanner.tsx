'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBannerAction } from '@/app/actions';

interface BannerData {
  enabled: boolean;
  text: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  countdownEnd?: string;
}

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-0.5">
      <span className="hidden sm:block mr-1">Valid till</span>
      <span className="mx-2 flex shrink-0 items-center gap-0.5 rounded-sm border border-black/20 bg-black/10 px-1 py-0.5 text-[10px] text-white sm:text-sm tabular-nums tracking-widest font-mono">
        <div className="flex items-center">{pad(timeLeft.d)}</div>
        <span className="text-white/80 mx-0.5">d : </span>
        <div className="flex items-center">{pad(timeLeft.h)}</div>
        <span className="text-white/80 mx-0.5">h :</span>
        <div className="flex items-center">{pad(timeLeft.m)}</div>
        <span className="text-white/80 mx-0.5">m :</span>
        <div className="flex items-center">{pad(timeLeft.s)}</div>
        <span className="text-white/80 mx-0.5 ml-1">s</span>
      </span>
    </div>
  );
};

export function LandingBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);

  useEffect(() => {
    getBannerAction().then((res) => {
      if (res.success && (res as any).data) {
        setBanner((res as any).data);
      }
    });
  }, []);

  if (!banner || !banner.enabled || !banner.text) return null;

  const isExternal = banner.buttonUrl?.startsWith('http');

  // Parse markdown bold **text**
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="rounded-sm font-bold">{part.slice(2, -2)}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className="flex w-full cursor-pointer items-center justify-center gap-0.5 px-2 py-1.5 text-left font-sans text-[11px] font-medium tracking-tight text-white sm:flex-row sm:px-4 sm:py-2 sm:text-sm md:text-center z-[6000] relative"
      style={{ 
        backgroundColor: banner.bgColor,
        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(0,0,0,0.1))'
      }}
    >
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div>{renderText(banner.text)}</div>
        
        {banner.countdownEnd && (
          <CountdownTimer targetDate={banner.countdownEnd} />
        )}

        {banner.buttonText && banner.buttonUrl && (
          isExternal ? (
            <a
              href={banner.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black hover:bg-white/90 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm transition-colors whitespace-nowrap ml-2"
            >
              {banner.buttonText}
            </a>
          ) : (
            <Link
              href={banner.buttonUrl}
              className="bg-white text-black hover:bg-white/90 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm transition-colors whitespace-nowrap ml-2"
            >
              {banner.buttonText}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
