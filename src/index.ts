import express from "express";
import routes from "./routes/routes";
import dotenv from "dotenv";
import mongoose from "mongoose";
import https from "https";
import fs from "fs";

dotenv.config();

let port = process.env.PORT ? Number(process.env.PORT) : 2102;
const dbUrl = process.env.MONGODB_URI || "";

const app = express();

app.use(express.json());
app.use(express.static("./public"));
app.use(routes);

function startServer() {
  try {
    app.listen({
      host: "0.0.0.0",
      port,
    });
  } catch (err) {
    console.error(err);
  }
  console.log(`Servidor iniciado em http://localhost:${port}`);
}

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Conectado ao banco de dados");
    startServer();
  })
  .catch((err) => {
    console.log(err);
  });

//using fs module to read key and certificate files

const key = fs.readFileSync("./src/certificates/private.key");
const cert = fs.readFileSync("./src/certificates/certificate.crt");

const options = {
  key: key,
  cert: cert,
};

https.createServer(options, app).listen(443);
