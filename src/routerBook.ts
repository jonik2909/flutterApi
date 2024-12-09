import express from "express";
import bookController from "./controllers/bookController";
import uploader from "./libs/utils/uploader";
const routerBook = express.Router();

routerBook.post("/member/signup", bookController.signup);

routerBook.post("/member/login", bookController.login);

routerBook.get(
  "/member/logout",
  bookController.verifyAuth,
  bookController.logout
);

routerBook.get("/member/all", bookController.getMembers);

routerBook.get(
  "/member/:id",
  bookController.retrieveAuth,
  bookController.getMember
);

routerBook.post(
  "/member/update",
  bookController.verifyAuth,
  uploader("members").single("memberImage"),
  bookController.updateMember
);

export default routerBook;
