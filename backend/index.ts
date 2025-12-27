import express from "express";
import cors from "cors";
import { YtDlp } from "ytdlp-nodejs";
import https from "https";

const app = express();
app.use(cors());
app.use(express.json());

// Download from URL
function downloadFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// Extract text from json3
function extractTextFromJson3(json3: any): string {
  const texts: string[] = [];
  if (json3.events) {
    for (const event of json3.events) {
      if (event.segs) {
        const text = event.segs
          .map((s: any) => s.utf8 || "")
          .join("")
          .trim();
        if (text) texts.push(text);
      }
    }
  }
  return texts.join(" ").slice(0, 2000);
}

// Fetch transcript using yt-dlp
async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const ytdlp = new YtDlp();
    const metadata: any = await ytdlp.getInfoAsync(
      `https://www.youtube.com/watch?v=${videoId}`
    );

    const sources = [metadata.automatic_captions, metadata.subtitles];

    for (const source of sources) {
      if (!source) continue;

      for (const lang of ["en", "en-US", "en-GB"]) {
        const subs = source[lang];
        if (!subs) continue;

        const json3 = subs.find((s: any) => s.ext === "json3");
        if (json3?.url) {
          const raw = await downloadFromUrl(json3.url);
          return extractTextFromJson3(JSON.parse(raw));
        }
      }

      // Fallback: first language
      const firstLang = Object.keys(source)[0];
      if (firstLang) {
        const json3 = source[firstLang]?.find((s: any) => s.ext === "json3");
        if (json3?.url) {
          const raw = await downloadFromUrl(json3.url);
          return extractTextFromJson3(JSON.parse(raw));
        }
      }
    }

    return "";
  } catch (e) {
    console.error(`Error for ${videoId}:`, e);
    return "";
  }
}

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Fetch transcripts
app.post("/transcripts", async (req, res) => {
  const { videoIds } = req.body;

  if (!videoIds || !Array.isArray(videoIds)) {
    return res.status(400).json({ error: "videoIds array required" });
  }

  console.log(`Fetching ${videoIds.length} transcripts...`);

  const results = await Promise.allSettled(
    videoIds.map(async (id: string) => ({
      id,
      transcript: await fetchTranscript(id),
    }))
  );

  const transcripts: Record<string, string> = {};
  for (const r of results) {
    if (r.status === "fulfilled") {
      transcripts[r.value.id] = r.value.transcript;
    }
  }

  res.json({ transcripts });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

export default app;
