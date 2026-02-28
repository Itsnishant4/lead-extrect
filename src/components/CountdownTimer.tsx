"use client";

import { useEffect, useState } from 'react';

export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) {
    return (
      <div className="flex items-center gap-0.5 opacity-0">
        <span className="hidden sm:block mr-1">Valid till</span>
        <span className="mx-2 flex shrink-0 items-center gap-0.5 rounded-sm border border-black/20 bg-black/10 px-1 py-0.5 text-[10px] text-white sm:text-sm tabular-nums tracking-widest font-mono">
          <div className="flex items-center">00</div>
          <span className="text-white/80 mx-0.5">d : </span>
          <div className="flex items-center">00</div>
          <span className="text-white/80 mx-0.5">h :</span>
          <div className="flex items-center">00</div>
          <span className="text-white/80 mx-0.5">m :</span>
          <div className="flex items-center">00</div>
          <span className="text-white/80 mx-0.5 ml-1">s</span>
        </span>
      </div>
    );
  }

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
