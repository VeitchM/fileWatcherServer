import express from "express";
import cors from "cors";
import chokidar from "chokidar";
import { EventEmitter } from "events";
import fs from "fs";

const app = express();
const PORT = 3000;
const WATCHED_FILES_PATH = ".";

// Serve your client-side files
app.use(express.static("public"));
app.use(cors());

// Watch for changes in the server filesystem
const watcher = chokidar.watch(WATCHED_FILES_PATH, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

const eventEmitter = new EventEmitter();
let fileContent = "";

// When a change is detected, loads changed in server memory and when that is finished emits event
watcher.on("change", (path) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${path}:`, err);
      return;
    }
    // Log the content to the console
    console.log(`File ${path} has been changed. Content:\n${data}`);
    handleFileContent(data);
  });
});

function handleFileContent(data: string) {
  fileContent = data;
  eventEmitter.emit("fileChanged", { message: "fileChanged" });
}

// Endpoint for SSE (Server-Sent Events)
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onFileChanged = () => {
    console.log("FileContent loaded", fileContent);

    res.write(`data: ${fileContent}`);
  };
  // eventEmitter.on("fileChanged", onFileChanged);
  const intervalID = setInterval(() => res.write("data: lalalalalal"), 5000);

  // Handle client disconnect
  req.on("close", () => {
    eventEmitter.removeListener("fileChanged", onFileChanged);
    clearInterval(intervalID);
  });
});

app.get("/log", (req, res) => {
  res.json({ data: "This is CORS-enabled for an allowed domain." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
