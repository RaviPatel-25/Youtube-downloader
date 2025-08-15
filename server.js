import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get video info
app.post("/get_info", async (req, res) => {
    const { url } = req.body;
    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }
        const info = await ytdl.getInfo(url);
        const formats = ytdl
            .filterFormats(info.formats, "videoandaudio")
            .map(f => f.qualityLabel)
            .filter((v, i, a) => v && a.indexOf(v) === i); // unique qualities

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            streams: formats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download MP3
app.post("/download/mp3", async (req, res) => {
    const { url } = req.body;
    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }
        res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
        res.setHeader("Content-Type", "audio/mpeg");
        ytdl(url, { filter: "audioonly" }).pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download MP4 (default quality 360p)
app.post("/download/mp4", async (req, res) => {
    const { url, quality } = req.body;
    const selectedQuality = quality || "360p";
    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }
        res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
        res.setHeader("Content-Type", "video/mp4");

        // Find matching quality or fallback to highest
        const info = await ytdl.getInfo(url);
        const format = info.formats.find(f => f.qualityLabel === selectedQuality && f.hasVideo && f.hasAudio)
            || ytdl.chooseFormat(info.formats, { quality: "highestvideo", filter: "videoandaudio" });

        ytdl.downloadFromInfo(info, { format }).pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
