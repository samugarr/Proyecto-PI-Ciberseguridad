import express from "express";
import cors from "cors";
import { UserController } from "./src/controllers/user.controller";
import { TransactionController } from "./src/controllers/transaction.controller";
import { LoginController } from "./src/controllers/login.controller";
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const app = express();

// Permitir peticiones desde Angular
app.use(cors({
  origin: "https://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const userController = new UserController();
app.post("/user", userController.registerUser.bind(userController));


const transactionController = new TransactionController();
app.get("/transactions", transactionController.getTransactions.bind(transactionController));
app.post("/transaction", transactionController.createTransaction.bind(transactionController));


const loginController = new LoginController();
app.post("/login", loginController.login.bind(loginController));
app.post("/salt", loginController.getSalt.bind(loginController));

const options: https.ServerOptions = {
    key: fs.readFileSync(path.resolve('./server/certs/server.key')),
    cert: fs.readFileSync(path.resolve('./server/certs/server.crt'))
};


https.createServer(options, app).listen(3000, () => {
    console.log('Servidor HTTPS escuchando en el puerto 3000');
});