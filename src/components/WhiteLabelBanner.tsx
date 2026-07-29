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
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 256 256" fill="currentColor">
            <path d="M187.58 144.84c-7.17-3.58-13.48-5.89-20.88-2.92-4.36 1.75-8.64 5.8-13.27 9.18-2.65 1.94-6.13 2.43-9.08 1.2-12.57-5.24-22.32-13.11-31.76-22.76-3.43-3.5-6.08-7.46-6.08-12.61 0-3.26 1.78-6.07 3.69-8.58 2.7-3.55 4.87-7.1 4.25-11.81-.93-7.07-5.9-12.87-10.65-17.74-5.3-5.44-10.82-10.59-16.73-15.41-3.11-2.54-5.7-5.43-5.48-9.83.26-5.08 3.25-9.18 6.14-13.15 3.43-4.71 6.99-9.19 9.95-14.22 2.26-3.84 3.06-8.22.99-12.27-3.62-7.07-9.01-12.78-14.93-17.86-5.81-5-12.16-9.14-18.33-13.72-3.74-2.78-7.46-3.83-11.9-2.43-5.49 1.73-10.28 4.8-15.05 7.94-6.35 4.18-11.42 9.61-15.47 15.75-6.14 9.31-9.54 19.59-8.54 30.9.55 6.22 2.28 12.13 4.83 17.85 7.31 16.4 17.36 30.59 30.16 42.87 16.63 15.93 35.08 29.34 56.31 38.35 7.64 3.25 15.88 5.38 24.37 6.11 2.79.24 5.56.52 8.35.55 9.02.09 16.1-3.56 21.98-10.32 3.77-4.34 6.69-9.15 8.11-14.73.8-3.16.3-5.82-2.25-7.7ZM128 232c-19.23 0-37.36-5.42-52.92-14.86l-35.63 9.84a8 8 0 0 1-9.85-9.85l9.84-35.63A103.86 103.86 0 0 1 24 128C24 70.65 70.65 24 128 24s104 46.65 104 104-46.65 104-104 104Z" />
          </svg>
          Contact on WhatsApp
        </a>
      </div>
    </div>
  );
}
