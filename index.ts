import express from "express";
import cors from "cors";
import chokidar from "chokidar";
import { EventEmitter } from "events";
import fs from "fs";
import { PORT, SERVER_URL, WATCHED_FILES } from "./serverConfig";

const app = express();

// Serve your client-side files
app.use(express.static("reactLog/dist"));
app.use(cors());

// Watch for changes in the server filesystem
const watcher = chokidar.watch(WATCHED_FILES, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

const eventEmitter = new EventEmitter();
let fileContent = "";
let filePath = "none";

// When a change is detected, loads changed in server memory and when that is finished emits event
watcher.on("change", (path) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${path}:`, err);
      return;
    }
    // Log the content to the console
    console.log(`File ${path} has been changed. Content:\n${data}`);
    handleFileContent(data,path);
  });
});

function handleFileContent(data: string,path:string) {
  fileContent = data;
  filePath=path
  eventEmitter.emit("fileChanged", { message: "fileChanged" });
}

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onFileChanged = () => {
    console.log("FileContent loaded", fileContent);
    res.write(`data:${JSON.stringify({data:fileContent, path:filePath})} \n\n`);
  };

  // Send a message to the client every 5 seconds

  eventEmitter.on("fileChanged", onFileChanged);

  // Handle client disconnect
  req.on("close", () => {
    eventEmitter.removeListener("fileChanged", onFileChanged);
  });
});

app.get("/log", (req, res) => {
  res.json({ data: fileContent,path:filePath });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_URL}`);
});
