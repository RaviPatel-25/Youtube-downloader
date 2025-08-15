import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();
app.use(cors());

app.get("/download", async (req, res) => {
    try {
        const videoURL = req.query.url;

        if (!videoURL) {
            return res.status(400).send("❌ YouTube URL is required");
        }

        // Validate URL
        if (!ytdl.validateURL(videoURL)) {
            return res.status(400).send("❌ Invalid YouTube URL");
        }

        console.log(`📥 Download request: ${videoURL}`);

        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        // Set headers for download
        res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

        // Stream best MP4 format
        ytdl(videoURL, { quality: "highest", filter: format => format.container === "mp4" })
            .on("error", err => {
                console.error("🚨 ytdl-core error:", err);
                res.status(500).send("Error during download: " + err.message);
            })
            .pipe(res);

    } catch (error) {
        console.error("🚨 Server error:", error);
        res.status(500).send("Error downloading video: " + error.message);
    }
});

app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
