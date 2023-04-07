// Complete Events Exercise
const { createServer } = require("http");
const { appendFile, readFile, createReadStream, read } = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const PORT = 5001;

const NewsLetter = new EventEmitter();

const server = createServer((req, res) => {
  const { url, method } = req;
  req.on("error", (err) => {
    console.error(err);
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Invalid request 404!" }));
    res.end();
  });
  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
    console.log(chunks);
  });
  req.on("end", () => {
    if (url === "/newsletter_signup" && method === "POST") {
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const newUser = `${body.name}, ${body.email}\n`;
      NewsLetter.emit("signup", newUser, res);

      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ msg: "Successfully signed up!" }));
      res.end();
    } else {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ msg: "not valid endpoint!" }));
      res.end();
    }
  });
});
server.listen(PORT, () => console.log("Server is listening at: " + PORT));

NewsLetter.on("signup", (contact, res) => {
  appendFile(path(__dirname, "./text.csv"), contact, (err) => {
    if (err) {
      NewsLetter.emit("error", err, res);
      return;
    }
    console.log("File uploaded!");
  });
});

NewsLetter.on("error", (err, res) => {
  console.error(err);
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify({ msg: "Error creating new sign-in" }));
  res.end();
});
