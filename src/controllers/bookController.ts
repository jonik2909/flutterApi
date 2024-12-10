import {
  ExtendedRequest,
  LoginInput,
  MemberInput,
  MemberInquiry,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import { Member } from "../libs/types/member";
import MemberService from "../models/Member.service";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";
import { MemberType } from "../libs/enums/member.enum";
import { BookInput, BookInquiry } from "../libs/types/book";
import BookService from "../models/Book.service";
import { BookCategory } from "../libs/enums/book.enum";

const bookController: T = {};
const memberService = new MemberService();
const authService = new AuthService();
const bookService = new BookService();

bookController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body,
      result: Member = await memberService.signup(input),
      token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body,
      result = await memberService.login(input),
      token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error, login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");
    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error, logout:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.getMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMember");
    const targetId = req.params.id;
    const result = await memberService.getMember(
      req.member?._id ?? null,
      targetId
    );

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMember:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.getMembers = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMembers");
    const { page, limit, order, memberType, search } = req.query;
    const inquiry: MemberInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (memberType) {
      inquiry.memberType = memberType as MemberType;
    }
    if (search) inquiry.search = String(search);

    const result = await memberService.getMembers(req.member, inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMembers:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    console.log("Error, verifyAuth:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);

    next();
  } catch (err) {
    console.log("Error, retrieveAuth:", err);
    next();
  }
};

bookController.verifyAuthor = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    if (req.member.memberType !== MemberType.AUTHOR)
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.ONLY_SPECIFIC_ROLES_ALLOWED
      );

    next();
  } catch (err) {
    console.log("Error, verifyAuth:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember");
    const input: MemberUpdateInput = req.body;
    if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");
    const result = await memberService.updateMember(req.member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateMember:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.likeTargetMember = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("likeTargetMember");
    const { id } = req.body;

    const result = await memberService.likeTargetMember(req.member, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, likeTargetMember:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// ********************

bookController.createBook = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createBook");
    if (!req.files?.length)
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );

    const data: BookInput = req.body;
    data.bookImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    data.memberId = req.member._id;

    console.log();

    const result = await bookService.createBook(data);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, createBook:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.getBooks = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getBooks");
    const { page, limit, order, bookCategory, search } = req.query;
    const inquiry: BookInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (bookCategory) {
      inquiry.bookCategory = bookCategory as BookCategory;
    }
    if (search) inquiry.search = String(search);

    const result = await bookService.getBooks(req.member, inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getBooks:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

bookController.getBook = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getBook");
    const targetId = req.params.id;
    const result = await bookService.getBook(req.member?._id ?? null, targetId);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getBook:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default bookController;
