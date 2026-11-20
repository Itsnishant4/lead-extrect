import Link from 'next/link';
import { SiteConfigService } from '@/services/siteconfig.service';
import { CountdownTimer } from './CountdownTimer';

export async function LandingBanner() {
  let banner;
  try {
    banner = await SiteConfigService.getBanner();
  } catch (error) {
    console.error('[LandingBanner] Failed to get banner:', error);
    return null;
  }

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
      <div className="flex-1 flex flex-row items-center justify-center gap-2 sm:gap-4">
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
