import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const access_token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const media_id:string = 'DGGQ2eGSYdy'
  if (!access_token) {
    return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
  }

  try {
    
    const response = await fetch(
      `https://graph.instagram.com/${media_id}?fields=id,media_type,media_url,thumbnail_url,caption&access_token=${access_token}`,
      {
        method: 'GET',
      }
    );
    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('Error from Instagram API:', errorData);
      return NextResponse.json(
        { error: errorData.error.message || 'Unknown error from Instagram API' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Instagram data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
