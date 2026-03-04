/**
 * Website Enricher
 * Finds emails and social links on a business website by crawling the homepage.
 */
import { getActiveProxies } from './proxy-cache';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

export interface EnrichmentData {
  emails: string[];
  phones: string[];
  socials: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
    tiktok?: string;
  };
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Simplified regex to prevent ReDoS, validation happens later
const PHONE_REGEX = /\+?[\d\s\-\.()]{10,20}/g;

export async function enrichLead(websiteUrl: string | null): Promise<EnrichmentData> {
  const result: EnrichmentData = {
    emails: [],
    phones: [],
    socials: {},
  };

  if (!websiteUrl || !websiteUrl.startsWith('http')) {
    return result;
  }

  try {
    const urlObj = new URL(websiteUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    const ips = await resolve4(hostname).catch(() => []);
    
    // SSRF Protection: Block localhost, loopback, private, and cloud metadata IPs
    const checkIp = (ip: string) => (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === '0.0.0.0' ||
      ip.startsWith('169.254.') || // Cloud Metadata (link-local)
      ip.startsWith('10.') ||      // Private network (Class A)
      ip.startsWith('fd') ||       // IPv6 private (ULA)
      ip.startsWith('fe80') ||     // IPv6 link-local
      ip.startsWith('::ffff:127.') || // IPv4-mapped IPv6 loopback
      ip.match(/^192\.168\.\d+\.\d+$/) || // Private network (Class C)
      ip.match(/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/) // Private network (Class B)
    );

    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.match(/^127\.\d+\.\d+\.\d+$/) ||
      ips.some(checkIp)
    ) {
      console.warn(`SSRF Blocked: Attempt to fetch private IP/hostname: ${hostname}`);
      return result;
    }
  } catch (e) {
    // Invalid URL
    return result;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      // Get active proxies for rotation
      const activeProxies = await getActiveProxies();
      const fetchOptions: RequestInit = {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      };

      if (activeProxies.length > 0) {
        const proxy = activeProxies[Math.floor(Math.random() * activeProxies.length)];
        const proxyUrl = proxy.username && proxy.password 
            ? `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
            : `${proxy.protocol}://${proxy.host}:${proxy.port}`;
        
        const agent = new HttpsProxyAgent(proxyUrl);
        // @ts-ignore
        fetchOptions.agent = agent;
      }

      const response = await fetch(websiteUrl, fetchOptions);

      if (!response.ok) return result;

      let html = await response.text();
      
      // Prevent ReDoS and Memory issues by stripping large script/style tags and limiting size
      html = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
      if (html.length > 500000) html = html.slice(0, 500000);
      
      // 1. Extract Emails
      const emails = html.match(EMAIL_REGEX);
      if (emails) {
        const validEmails = Array.from(new Set(emails.map(e => e.toLowerCase()))).filter(e => {
          return !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.jpeg') && !e.endsWith('.gif') &&
                 !e.includes('sentry.io') && !e.includes('example.com') && !e.includes('wixpress.com');
        });
        result.emails = validEmails;
      }

      // 2. Extract Phone Numbers
      const telMatches = html.match(/href="tel:([^"]+)"/g) || [];
      const telPhones = telMatches.map(m => m.slice(10, -1));
      
      const regexPhones = html.match(PHONE_REGEX) || [];
      const allRawPhones = [...telPhones, ...regexPhones];

      if (allRawPhones.length > 0) {
        const validPhones = Array.from(new Set(allRawPhones.map(p => p.trim()))).filter(p => {
          const digits = p.replace(/\D/g, '');
          
          // Filter out years and common small numbers
          if (digits.length < 8) return false;
          if (/202[0-9]|2030/.test(digits) && digits.length <= 4) return false;
          
          // Filter out repeating sequences (e.g. 0000000)
          if (/(\d)\1{5,}/.test(digits)) return false;

          return digits.length >= 10 && digits.length <= 13;
        });
        result.phones = validPhones;
      }

      // 3. Extract Social Links
      const socialPatterns = {
        facebook: /facebook\.com\/([a-zA-Z0-9.]+)/,
        instagram: /instagram\.com\/([a-zA-Z0-9.]+)/,
        linkedin: /linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)/,
        twitter: /(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/,
        youtube: /youtube\.com\/(c|channel|user)\/([a-zA-Z0-9_-]+)/,
        pinterest: /pinterest\.com\/([a-zA-Z0-9.]+)/,
        tiktok: /tiktok\.com\/@([a-zA-Z0-9._-]+)/,
      };

      // Find all hrefs
      const hrefMatches = html.match(/href="([^"]+)"/g) || [];
      hrefMatches.forEach(match => {
        const url = match.slice(6, -1);
        
        if (url.includes('facebook.com') && !result.socials.facebook) {
          const m = url.match(socialPatterns.facebook);
          if (m) result.socials.facebook = `https://www.facebook.com/${m[1]}`;
        }
        if (url.includes('instagram.com') && !result.socials.instagram) {
          const m = url.match(socialPatterns.instagram);
          if (m) result.socials.instagram = `https://www.instagram.com/${m[1]}`;
        }
        if (url.includes('linkedin.com') && !result.socials.linkedin) {
          const m = url.match(socialPatterns.linkedin);
          if (m) result.socials.linkedin = `https://www.linkedin.com/${m[1]}/${m[2]}`;
        }
        if ((url.includes('twitter.com') || url.includes('x.com')) && !result.socials.twitter) {
          const m = url.match(socialPatterns.twitter);
          if (m) result.socials.twitter = `https://x.com/${m[2]}`;
        }
        if (url.includes('youtube.com') && !result.socials.youtube) {
          const m = url.match(socialPatterns.youtube);
          if (m) result.socials.youtube = url.startsWith('http') ? url : `https://www.youtube.com${url}`;
        }
        if (url.includes('tiktok.com') && !result.socials.tiktok) {
          const m = url.match(socialPatterns.tiktok);
          if (m) result.socials.tiktok = `https://www.tiktok.com/@${m[1]}`;
        }
        if (url.includes('pinterest.com') && !result.socials.pinterest) {
          const m = url.match(socialPatterns.pinterest);
          if (m) result.socials.pinterest = `https://www.pinterest.com/${m[1]}`;
        }
      });
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    // console.error(`Enrichment failed for ${websiteUrl}:`, error);
  }

  return result;
}
