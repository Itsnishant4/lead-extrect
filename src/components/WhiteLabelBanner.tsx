import { WhatsappLogo } from "phosphor-react";

export function WhiteLabelBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:gap-4 sm:py-3">
        <span className="text-center text-xs font-medium text-white sm:text-sm">
          This app is available for white label — connect with us
        </span>
        <a
          href="https://wa.me/919773005701"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 sm:px-4 sm:py-1.5 sm:text-sm"
        >
          <WhatsappLogo weight="fill" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Contact on WhatsApp
        </a>
      </div>
    </div>
  );
}
