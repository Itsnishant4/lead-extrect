export interface Lead {
  name: string;
  address: string | null;
  city: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  reviewsCount: number | null;
  category: string | null;
  placeId: string | null;
  latitude: number | null;
  longitude: number | null;
  directionUrl: string | null;
  hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  } | null;
  socials: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
    tiktok?: string;
  } | null;
  website_email?: string | null;
  website_phone?: string | null;
}

export function parseMapResponse(data: any): Lead[] {
  const leads: Lead[] = [];

  try {
    const results = data[0][1];
    if (!Array.isArray(results)) return leads;

    for (const item of results) {
      if (!Array.isArray(item) || item.length < 15) continue;

      const bizData = item[14];
      if (!bizData) continue;

      // Better Name Extraction (index 11 is usually the clean name)
      // If 11 is empty, fallback to 18
      const name = bizData[11] || bizData[18];
      const address = bizData[39];
      const website = bizData[7] ? bizData[7][0] : null;
      const phone = bizData[178] ? bizData[178][0][0] : null;
      const rating = bizData[4] ? bizData[4][7] : null;
      const reviewsCount = bizData[4] ? bizData[4][8] : null;
      const category = bizData[13] ? bizData[13][0] : null;
      const placeId = bizData[78];

      const coords = bizData[9];
      const lat = coords ? coords[2] : null;
      const lng = coords ? coords[3] : null;

      // Direction URL
      const directionUrl = lat && lng ? `https://www.google.com/maps/dir//${lat},${lng}` : null;

      // Improved City Parsing for India (targeting [City], [State Pincode], [Country])
      let city = null;
      if (address) {
        const parts = address.split(',').map((s: string) => s.trim());
        if (parts.length >= 2) {
          // If the last part is 'India', the city is usually 2 steps back.
          // If the last part is 'State Pincode', the city is 1 step back.
          const lastPart = parts[parts.length - 1];
          const secondLast = parts[parts.length - 2];

          if (lastPart.toLowerCase() === 'india') {
            city = parts[parts.length - 3] || secondLast;
          } else {
            city = secondLast;
          }

          // Clean up if city still contains numbers (likely an area with zip)
          if (city && /\d/.test(city) && parts.length > 2) {
            const possibleCity = parts[parts.length - 3];
            if (possibleCity && !/\d/.test(possibleCity)) {
              city = possibleCity;
            }
          }
        }
      }

      // Hours Extraction (index 34 usually contains hours array)
      const hoursData = bizData[34]?.[1];
      const hours: any = {};
      if (Array.isArray(hoursData)) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        // Google often starts with Sunday or Monday depending on locale
        // We'll just map them if they look like day strings
        hoursData.forEach((h: any) => {
          if (typeof h === 'string') {
            const day = days.find(d => h.toLowerCase().includes(d));
            if (day) hours[day] = h.split(':').slice(1).join(':').trim();
          }
        });
      }

      // Social Links & Email (Very limited in initial search results)
      // Sometimes links are in bizData[12] or bizData[100]+
      const socials: any = {};
      let email = null;

      if (bizData[12] && Array.isArray(bizData[12])) {
        bizData[12].forEach((linkObj: any) => {
          const url = linkObj?.[0];
          if (url) {
            if (url.includes('facebook.com')) socials.facebook = url;
            if (url.includes('instagram.com')) socials.instagram = url;
            if (url.includes('linkedin.com')) socials.linkedin = url;
            if (url.includes('twitter.com') || url.includes('x.com')) socials.twitter = url;
            if (url.includes('youtube.com')) socials.youtube = url;
            if (url.includes('mailto:')) email = url.replace('mailto:', '');
          }
        });
      }

      if (name) {
        leads.push({
          name,
          address: address || null,
          city,
          website: website || null,
          phone: phone || null,
          email,
          rating: typeof rating === 'number' ? rating : null,
          reviewsCount: typeof reviewsCount === 'number' ? reviewsCount : null,
          category: typeof category === 'string' ? category : (Array.isArray(category) ? String(category[0] ?? '') : null) || null,
          placeId: placeId || null,
          latitude: lat,
          longitude: lng,
          directionUrl,
          hours: Object.keys(hours).length > 0 ? hours : null,
          socials: Object.keys(socials).length > 0 ? socials : null,
        });
      }
    }
  } catch (error) {
    console.error('Error parsing map response:', error);
  }

  return leads;
}
