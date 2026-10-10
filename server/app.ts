import express from "express";
import { UserController } from "./src/controllers/user.controller";

const app = express();

app.use(express.json());

const userController = new UserController();
app.post("/user", userController.registerUser.bind(userController));

app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});