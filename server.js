import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();
app.use(cors());

app.get("/download", async (req, res) => {
    try {
        const videoURL = req.query.url;
        if (!videoURL) {
            return res.status(400).send("YouTube URL is required");
        }

        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
        ytdl(videoURL, { format: "mp4" }).pipe(res);
    } catch (error) {
        res.status(500).send("Error downloading video");
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});
