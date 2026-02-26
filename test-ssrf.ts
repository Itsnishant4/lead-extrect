import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

async function checkSSRF(hostname: string) {
    try {
        const ips = await resolve4(hostname);
        console.log(`Resolved ${hostname} to IPs:`, ips);
        for (const ip of ips) {
             if (
                  ip === '127.0.0.1' ||
                  ip === '::1' ||
                  ip.startsWith('169.254.') || // Cloud Metadata
                  ip.startsWith('10.') ||      // Private network
                  ip.match(/^192\.168\.\d+\.\d+$/) || // Private network
                  ip.match(/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/) // Private network
                ) {
                    console.log(`BLOCKED SSRF IP: ${ip}`);
                    return false;
                }
        }
        return true;
    } catch (e) {
        console.log(`DNS error for ${hostname}`, e);
        return false;
    }
}

checkSSRF('127.0.0.1.nip.io');
