import { db } from './db';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch, { RequestInit } from 'node-fetch';

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
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,6}/g;

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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const activeProxies = await db`SELECT * FROM proxies WHERE is_active = 1`;
        let fetchOptions: RequestInit = {
            // @ts-ignore
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

        clearTimeout(timeout);

        if (!response.ok) return result;

        const html = await response.text();

        const emails = html.match(EMAIL_REGEX);
        if (emails) {
            const validEmails = Array.from(new Set(emails.map((e: string) => e.toLowerCase()))).filter((e: string) => {
                return !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.jpeg') && !e.endsWith('.gif') &&
                    !e.includes('sentry.io') && !e.includes('example.com') && !e.includes('wixpress.com');
            });
            result.emails = validEmails;
        }

        const telMatches = html.match(/href="tel:([^"]+)"/g) || [];
        const telPhones = telMatches.map((m: string) => m.slice(10, -1));

        const regexPhones = html.match(PHONE_REGEX) || [];
        const allRawPhones = [...telPhones, ...regexPhones];

        if (allRawPhones.length > 0) {
            const validPhones = Array.from(new Set(allRawPhones.map((p: string) => p.trim()))).filter((p: string) => {
                const digits = p.replace(/\D/g, '');
                if (digits.length < 8) return false;
                if (/202[0-9]|2030/.test(digits) && digits.length <= 4) return false;
                if (/(\d)\1{5,}/.test(digits)) return false;
                const isIndianMobile = (digits.length === 10 && /^[6-9]/.test(digits)) ||
                    (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2)));
                return (digits.length >= 10 && digits.length <= 13) || isIndianMobile;
            });
            result.phones = validPhones;
        }

        const socialPatterns = {
            facebook: /facebook\.com\/([a-zA-Z0-9.]+)/,
            instagram: /instagram\.com\/([a-zA-Z0-9.]+)/,
            linkedin: /linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)/,
            twitter: /(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/,
            youtube: /youtube\.com\/(c|channel|user)\/([a-zA-Z0-9_-]+)/,
            pinterest: /pinterest\.com\/([a-zA-Z0-9.]+)/,
            tiktok: /tiktok\.com\/@([a-zA-Z0-9._-]+)/,
        };

        const hrefMatches = html.match(/href="([^"]+)"/g) || [];
        hrefMatches.forEach((match: string) => {
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

    } catch (error) {
        // Silent fail
    }

    return result;
}
