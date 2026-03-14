import { db } from '@/lib/db/index';
import { proxies } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Use dynamic import for proxy agents to avoid issues
let HttpsProxyAgent: any = null;
let SocksProxyAgent: any = null;

async function getProxyAgents() {
  if (!HttpsProxyAgent) {
    const https = await import('https-proxy-agent');
    HttpsProxyAgent = https.HttpsProxyAgent;
  }
  if (!SocksProxyAgent) {
    const socks = await import('socks-proxy-agent');
    SocksProxyAgent = socks.SocksProxyAgent;
  }
  return { HttpsProxyAgent, SocksProxyAgent };
}

export class ProxyService {
  static async getProxies(userId: number) {
    return await db.select().from(proxies).where(eq(proxies.userId, userId)).orderBy(desc(proxies.createdAt));
  }

  static async getAllProxies() {
    return await db.select().from(proxies).orderBy(desc(proxies.createdAt));
  }

  static async getActiveProxiesGlobal() {
    return await db.select().from(proxies).where(eq(proxies.isActive, true));
  }

  static async deleteAllProxies() {
    await db.delete(proxies);
  }

  static async addProxy(userId: number | null, proxyData: any) {
    await db.insert(proxies).values({
      userId: userId,
      host: proxyData.host,
      port: proxyData.port,
      username: proxyData.username || null,
      password: proxyData.password || null,
      protocol: proxyData.protocol || 'http',
      isActive: proxyData.is_active !== undefined ? Boolean(proxyData.is_active) : true,
    });
  }

  static async deleteProxy(userId: number | null, id: number) {
    if (userId) {
      await db.delete(proxies).where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
    } else {
      await db.delete(proxies).where(eq(proxies.id, id));
    }
  }

  static async toggleProxy(userId: number | null, id: number, isActive: boolean) {
    if (userId) {
      await db.update(proxies).set({ isActive }).where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
    } else {
      await db.update(proxies).set({ isActive }).where(eq(proxies.id, id));
    }
  }

  static async disableProxy(id: number) {
    await db.update(proxies).set({ isActive: false }).where(eq(proxies.id, id));
  }

  static async testProxyConnection(proxy: any): Promise<{ success: boolean; latency?: number; error?: string }> {
    const { HttpsProxyAgent, SocksProxyAgent } = await getProxyAgents();
    
    const proxyProtocol = proxy.protocol === 'socks5' ? 'socks5' : 'http';
    let proxyUrl: string;
    
    if (proxy.username && proxy.password) {
      proxyUrl = `${proxyProtocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    } else {
      proxyUrl = `${proxyProtocol}://${proxy.host}:${proxy.port}`;
    }

    const testUrl = 'https://api.ipify.org?format=json';

    const fetchOptions: any = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };

    if (proxyProtocol === 'socks5') {
      fetchOptions.agent = new SocksProxyAgent(proxyUrl);
    } else {
      fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
    }

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(testUrl, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        return { success: true, latency };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error: any) {
      let errorMessage = 'Unknown error';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused';
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorMessage = 'Timeout';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'DNS error';
      } else if (error.message?.includes('socket')) {
        errorMessage = 'Socket error';
      } else {
        errorMessage = error.message?.substring(0, 50) || 'Unknown error';
      }

      return { success: false, error: errorMessage };
    }
  }
}
