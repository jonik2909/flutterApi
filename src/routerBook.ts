import express from "express";
import bookController from "./controllers/bookController";
const routerBook = express.Router();

routerBook.post("/member/signup", bookController.signup);
routerBook.post("/member/login", bookController.login);
routerBook.get(
  "/member/logout",
  bookController.verifyAuth,
  bookController.logout
);
routerBook.get(
  "/member/:id",
  bookController.retrieveAuth,
  bookController.getMember
);

export default routerBook;
