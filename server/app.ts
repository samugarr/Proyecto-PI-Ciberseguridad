import express from "express";
import { UserController } from "./src/controllers/user.controller";
import { TransactionController } from "./src/controllers/transaction.controller";
import { LoginController } from "./src/controllers/login.controller";

const app = express();

app.use(express.json());

const userController = new UserController();
app.post("/user", userController.registerUser.bind(userController));


const transactionController = new TransactionController();
app.post("/transaction", transactionController.createTransaction.bind(transactionController));


const loginController = new LoginController();
app.post("/login", loginController.login.bind(loginController));


app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});