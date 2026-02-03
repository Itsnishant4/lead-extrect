import { parseGoogleMapsResponse, Lead } from './parser';
import { db } from '@/lib/db/index';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function fetchLeads(query: string): Promise<Lead[]> {
  const url = `https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=in&pb=!4m12!1m3!1d117505.12183559002!2d72.5714!3d23.0225!2m3!1f0!2f0!3f0!3m2!1i1440!2i333!4f13.1!7i20!8i0!10b1!12m25!1m5!18b1!30b1!31m1!1b1!34e1!2m3!5m1!6e2!20e3!10b1!12b1!13b1!16b1!17m1!3e1!20m4!5e2!6b1!8b1!14b1!46m1!1b0!96b1!99b1!19m4!2m3!1i360!2i120!4i8!20m65!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!15m16!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20&q=${encodeURIComponent(query)}`;
  
  // Get active proxies for rotation
  const activeProxies = await db`SELECT * FROM proxies WHERE is_active = 1`;
  let fetchOptions: RequestInit = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
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
      throw new Error(`Failed to fetch from Google Maps: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Google Maps response often starts with some junk like /*[X,Y,Z]*/
    // We need to extract the JSON part.
    // It's usually everything after the first '[' or something similar.
    const startIdx = text.indexOf('[[');
    if (startIdx === -1) {
      console.error('Could not find JSON start in response');
      return [];
    }

    // Sometimes there's junk at the end too.
    // Let's try to parse it.
    let jsonStr = text.substring(startIdx);
    
    // Remove common trailer junk
    const endIdx = jsonStr.lastIndexOf(']');
    if (endIdx !== -1) {
        jsonStr = jsonStr.substring(0, endIdx + 1);
    }

    try {
      const data = JSON.parse(jsonStr);
      return parseGoogleMapsResponse(data);
    } catch (e) {
      // Sometimes it's a serialized string that needs more cleaning
      console.error('JSON parse error, attempting fallback cleaning...', e);
      // Fallback: the response might be a string like "/*JSON*/data"
      const cleaned = text.replace(/^[^\[]*/, '').replace(/[^\]]*$/, '');
      const data = JSON.parse(cleaned);
      return parseGoogleMapsResponse(data);
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}
