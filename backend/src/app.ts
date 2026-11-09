import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo";
// son las importaciones de productos
import productRouter from "./routes/products.routes";
// importaciones del usuario
import userRouter from "./routes/user.router";
import cookieParser from "cookie-parser";
dotenv.config();
connectDB();

const app = express();
const port = process.env.port;

app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Servidor Listo en el Puerto ${port}`);
});
