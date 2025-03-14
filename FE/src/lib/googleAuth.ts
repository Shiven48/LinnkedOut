import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,  
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL
);

export const generateAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.force-ssl', 
    'https://www.googleapis.com/auth/youtube.readonly', 
    'https://www.googleapis.com/auth/youtubepartner'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
};

export const getAccessToken = async (code:string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export default oauth2Client;
