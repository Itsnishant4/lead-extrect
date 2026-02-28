import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from '@/components/LandingBanner';
import { LandingFooter } from '@/components/LandingFooter';
import Link from 'next/link';
import { MapPinOff, ArrowRight, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found | LeadSpotter',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
      <LandingBanner />
      <LandingHeader />
      
      <main className="flex-grow flex items-center justify-center pt-40 pb-20 px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <MapPinOff className="text-indigo-600 w-12 h-12" />
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black text-indigo-950 mb-4 tracking-tighter drop-shadow-sm">
            404
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
            Looks like this page got lost.
          </h2>
          
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto">
            We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200/50 w-full sm:w-auto justify-center"
            >
              <Home size={20} /> Back to Homepage
            </Link>
            <Link 
              href="/features" 
              className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors w-full sm:w-auto justify-center"
            >
              Explore Features <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}