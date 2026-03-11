import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/ratelimit';
import { handleApiError } from '@/lib/utils/api-error-handler';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!(await checkRateLimit(`pincodes:${ip}`, 30, 60000))) { // 30 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (!city) {
        return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.postalpincode.in/postoffice/${city}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success') {
            // Extract unique pincodes
            const pincodes = new Set<string>();
            data[0].PostOffice.forEach((po: any) => {
                if (po.Pincode) pincodes.add(po.Pincode);
            });

            return NextResponse.json({
                success: true,
                pincodes: Array.from(pincodes),
                count: pincodes.size
            });
        } else {
            return NextResponse.json({ success: false, error: 'No pincodes found' }, { status: 404 });
        }
    } catch (error) {
        return handleApiError(error);
    }
}
