import express from "express";
import { registerUser } from "./src/controllers/user.controller";

const app = express();

app.use(express.json());

app.post("/user", registerUser);

app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});