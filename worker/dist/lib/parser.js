"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGoogleMapsResponse = parseGoogleMapsResponse;
function parseGoogleMapsResponse(data) {
    const leads = [];
    try {
        const results = data[0][1];
        if (!Array.isArray(results))
            return leads;
        for (const item of results) {
            if (!Array.isArray(item) || item.length < 15)
                continue;
            const bizData = item[14];
            if (!bizData)
                continue;
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
            const directionUrl = lat && lng ? `https://www.google.com/maps/dir//${lat},${lng}` : null;
            let city = null;
            if (address) {
                const parts = address.split(',').map((s) => s.trim());
                if (parts.length >= 2) {
                    const lastPart = parts[parts.length - 1];
                    const secondLast = parts[parts.length - 2];
                    if (lastPart.toLowerCase() === 'india') {
                        city = parts[parts.length - 3] || secondLast;
                    }
                    else {
                        city = secondLast;
                    }
                    if (city && /\d/.test(city) && parts.length > 2) {
                        const possibleCity = parts[parts.length - 3];
                        if (possibleCity && !/\d/.test(possibleCity)) {
                            city = possibleCity;
                        }
                    }
                }
            }
            const hoursData = bizData[34]?.[1];
            const hours = {};
            if (Array.isArray(hoursData)) {
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                hoursData.forEach((h) => {
                    if (typeof h === 'string') {
                        const day = days.find(d => h.toLowerCase().includes(d));
                        if (day)
                            hours[day] = h.split(':').slice(1).join(':').trim();
                    }
                });
            }
            const socials = {};
            let email = null;
            if (bizData[12] && Array.isArray(bizData[12])) {
                bizData[12].forEach((linkObj) => {
                    const url = linkObj?.[0];
                    if (url) {
                        if (url.includes('facebook.com'))
                            socials.facebook = url;
                        if (url.includes('instagram.com'))
                            socials.instagram = url;
                        if (url.includes('linkedin.com'))
                            socials.linkedin = url;
                        if (url.includes('twitter.com') || url.includes('x.com'))
                            socials.twitter = url;
                        if (url.includes('youtube.com'))
                            socials.youtube = url;
                        if (url.includes('mailto:'))
                            email = url.replace('mailto:', '');
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
                    category: Array.isArray(category) ? category[0] : category || null,
                    placeId: placeId || null,
                    latitude: lat,
                    longitude: lng,
                    directionUrl,
                    hours: Object.keys(hours).length > 0 ? hours : null,
                    socials: Object.keys(socials).length > 0 ? socials : null,
                });
            }
        }
    }
    catch (error) {
        console.error('Error parsing Google Maps response:', error);
    }
    return leads;
}
