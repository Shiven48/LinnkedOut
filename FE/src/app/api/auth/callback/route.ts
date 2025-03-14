// src/app/api/auth/callback/route.ts

import { getAccessToken } from '../../../../lib/googleAuth'; // Import the token exchange helper

export async function GET(req: Request) {
  const url = new URL(req.url); // Extract query parameters
  const code = url.searchParams.get('code'); // Get the authorization code

  if (!code) {
    return new Response('No code received', { status: 400 });
  }

  try {
    // Exchange the code for an access token
    const tokens = await getAccessToken(code);
    
    // You can store the token here, for example, in a session or database
    return new Response(JSON.stringify(tokens), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Failed to exchange code for tokens', { status: 500 });
  }
}
