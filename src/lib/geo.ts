interface GeoLocation {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export async function getGeoLocation(ip: string): Promise<GeoLocation | null> {
  try {
    if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return null;
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== 'success') return null;

    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      latitude: data.lat || 0,
      longitude: data.lon || 0,
    };
  } catch (error) {
    console.error('[GeoLocation] Error:', error);
    return null;
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || 'unknown';
}
