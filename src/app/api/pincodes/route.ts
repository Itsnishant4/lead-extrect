
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

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
        return NextResponse.json({ error: 'Failed to fetch pincodes' }, { status: 500 });
    }
}
