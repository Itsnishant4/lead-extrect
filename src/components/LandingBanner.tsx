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
}

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

  return (
    <div
      className="w-full py-2.5 px-4 text-center text-white text-sm font-medium flex items-center justify-center gap-3 flex-wrap"
      style={{ backgroundColor: banner.bgColor }}
    >
      <span>{banner.text}</span>
      {banner.buttonText && banner.buttonUrl && (
        isExternal ? (
          <a
            href={banner.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors inline-block"
          >
            {banner.buttonText}
          </a>
        ) : (
          <Link
            href={banner.buttonUrl}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors inline-block"
          >
            {banner.buttonText}
          </Link>
        )
      )}
    </div>
  );
}
