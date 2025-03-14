import { generateAuthUrl } from '../../../../lib/googleAuth'; // Import your helper function

export async function GET(req: Request) {
  const authUrl = generateAuthUrl(); // Generate the OAuth URL
  return Response.redirect(authUrl); // Redirect to Google OAuth
}