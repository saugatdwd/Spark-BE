import express from "express";
import cors from "cors";
import logger from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/mongoose";
import routes from "./routes";

dotenv.config({ path: ".env" });

const app = express();

// Connect to MongoDB
connectDB();

// CORS setup to allow your frontend IP
app.use(
  cors({
    origin: "http://192.168.1.65:8081", // Allow only the frontend to access this server
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,  // Allow credentials (cookies, authentication)
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

const port = process.env.PORT || 8082;
const address = process.env.SERVER_ADDRESS || "localhost";

app.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

app.listen(port, () =>
  console.log(`Server running on http://${address}:${port}`)
);
