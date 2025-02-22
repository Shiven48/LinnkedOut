import { NextApiRequest, NextApiResponse } from 'next';
import { getLatestVideos } from "@/src/server/functions/media";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const videos = await getLatestVideos();
            res.status(200).json(videos);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching videos' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }

    if(req.method === 'POST') {
        try{
            
        } catch(error){

        }
    } else{
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}