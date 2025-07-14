import express from "express";
import cors from "cors";
import logger from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/mongoose";
import routes from "./routes";
import http from 'http';
import setupSocket from './config/socket';
import setupSwagger from './config/swagger';

dotenv.config({ path: ".env" });

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// CORS setup to allow your frontend IP
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://192.168.1.66:8081",
  "*"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middlewares & Configs
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: any, res: any, next: any) => {
  res.locals.user = req.user;
  next();
});

app.use(routes);
setupSocket(server);
setupSwagger(app);

const port = process.env.PORT || 8082;
const address = process.env.SERVER_ADDRESS || "localhost";

app.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

server.listen(port, () =>
  console.log(`Server running on http://${address}:${port}`)
);
