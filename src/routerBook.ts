import express from "express";
import bookController from "./controllers/bookController";
import uploader from "./libs/utils/uploader";
const routerBook = express.Router();

/***********************************************
 *                                             *
 *               MEMBER API                    *
 *                                             *
 ***********************************************/

routerBook.post("/member/signup", bookController.signup);
routerBook.post("/member/login", bookController.login);
routerBook.get("/member/logout", bookController.logout);
routerBook.get(
  "/member/all",
  bookController.retrieveAuth,
  bookController.getMembers
);
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
routerBook.post(
  "/member/like",
  bookController.verifyAuth,
  bookController.likeTargetMember
);

/***********************************************
 *                                             *
 *               BOOK API                      *
 *                                             *
 ***********************************************/

routerBook.post(
  "/book/create",
  bookController.verifyAuthor,
  uploader("books").array("bookImages", 5),
  bookController.createBook
);

routerBook.get(
  "/book/all",
  bookController.retrieveAuth,
  bookController.getBooks
);

routerBook.get(
  "/book/my",
  bookController.verifyAuthor,
  bookController.getMyBooks
);

routerBook.get(
  "/book/:id",
  bookController.retrieveAuth,
  bookController.getBook
);

routerBook.post(
  "/book/update",
  bookController.verifyAuthor,
  uploader("books").array("bookImages", 5),
  bookController.updateBook
);

routerBook.post(
  "/book/delete",
  bookController.verifyAuthor,
  bookController.deleteBook
);

routerBook.post(
  "/book/like",
  bookController.verifyAuth,
  bookController.likeTargetBook
);

/***********************************************
 *                                             *
 *               ADMIN API                     *
 *                                             *
 ***********************************************/

routerBook.get(
  "/admin/member/all",
  bookController.verifyAdmin,
  bookController.getAllMembers
);

routerBook.post(
  "/admin/member/delete",
  bookController.verifyAdmin,
  bookController.removeMember
);

routerBook.get(
  "/admin/book/all",
  bookController.verifyAdmin,
  bookController.getAllBooks
);

routerBook.post(
  "/admin/book/delete",
  bookController.verifyAdmin,
  bookController.removeBook
);

export default routerBook;
