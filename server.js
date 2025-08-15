import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/download", (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || "360p";

    if (!videoURL) return res.status(400).send("No video URL provided");

    const output = path.join("downloads", `video.mp4`);
    if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

    // Map quality label to yt-dlp format codes
    const qualityMap = {
        "144p": "best[height<=144]",
        "240p": "best[height<=240]",
        "360p": "best[height<=360]",
        "480p": "best[height<=480]",
        "720p": "best[height<=720]",
        "1080p": "best[height<=1080]"
    };
    const format = qualityMap[quality] || qualityMap["360p"];

    exec(`yt-dlp -f "${format}" -o "${output}" "${videoURL}"`, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Download failed");
        }
        res.download(output, "video.mp4", () => {
            fs.unlinkSync(output);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
