import { parseGoogleMapsResponse, Lead } from './parser';
import { db } from '@/lib/db/index';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function fetchLeads(
  query: string, 
  latitude?: number, 
  longitude?: number, 
  options?: { userAgent?: string; acceptLanguage?: string }
): Promise<Lead[]> {
  // Default coordinates (Ahmedabad) if none provided
  const lat = latitude || 23.0225;
  const lng = longitude || 72.5714;
  
  const allLeads: Lead[] = [];
  const MAX_PAGES = 20;
  let offset = 0;
  let hasMore = true;

  // Get active proxies for rotation
  const activeProxies = await db`SELECT * FROM proxies WHERE is_active = 1`;
  
  while (hasMore && (offset / 20) < MAX_PAGES) {
    // console.log(`Fetching leads for "${query}" - Page ${offset / 20 + 1} (Offset: ${offset})`);
    
    const url = `https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=in&pb=!4m12!1m3!1d117505.12183559002!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1440!2i333!4f13.1!7i20!8i${offset}!10b1!12m25!1m5!18b1!30b1!31m1!1b1!34e1!2m3!5m1!6e2!20e3!10b1!12b1!13b1!16b1!17m1!3e1!20m4!5e2!6b1!8b1!14b1!46m1!1b0!96b1!99b1!19m4!2m3!1i360!2i120!4i8!20m65!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!15m16!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20&q=${encodeURIComponent(query)}`;
    console.log(`[EXTRACTOR] Fetching ${query} at ${lat},${lng} (Offset: ${offset})`);
    
    let fetchOptions: RequestInit = {
      headers: {
        'User-Agent': options?.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': options?.acceptLanguage || 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/maps',
      },
    };

    if (activeProxies.length > 0) {
      // Pick a random proxy for rotation
      const proxy = activeProxies[Math.floor(Math.random() * activeProxies.length)];
      const proxyUrl = proxy.username && proxy.password 
          ? `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
          : `${proxy.protocol}://${proxy.host}:${proxy.port}`;
      
      console.log(`Using proxy: ${proxy.host}:${proxy.port} (${proxy.protocol})`);
      
      // Create proxy agent
      const agent = new HttpsProxyAgent(proxyUrl);
      // @ts-ignore - agent is supported in fetch and undici
      fetchOptions.agent = agent;
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        console.error(`Failed to fetch offset ${offset}: ${response.statusText}`);
        break; 
      }

      const text = await response.text();
      const startIdx = text.indexOf('[[');
      if (startIdx === -1) {
        hasMore = false;
        continue;
      }

      let jsonStr = text.substring(startIdx);
      const endIdx = jsonStr.lastIndexOf(']');
      if (endIdx !== -1) {
          jsonStr = jsonStr.substring(0, endIdx + 1);
      }

      try {
        const data = JSON.parse(jsonStr);
        const pageLeads = parseGoogleMapsResponse(data);
        
        if (pageLeads.length === 0) {
          hasMore = false;
        } else {
          allLeads.push(...pageLeads);
          offset += 20;
          // Small delay to avoid aggressive rate limits
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (e) {
        console.error('JSON parse error, attempting fallback cleaning...', e);
        const cleaned = text.replace(/^[^\[]*/, '').replace(/[^\]]*$/, '');
        const data = JSON.parse(cleaned);
        const pageLeads = parseGoogleMapsResponse(data);
        
        if (pageLeads.length === 0) {
          hasMore = false;
        } else {
          allLeads.push(...pageLeads);
          offset += 20;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      hasMore = false;
    }
  }

  console.log(`[EXTRACTOR] Finished extraction for ${query}. Total found: ${allLeads.length}`);
  return allLeads;
}
