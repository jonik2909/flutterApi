import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import {
  lookupAuthMemberLiked,
  shapeIntoMongooseObjectId,
} from "../libs/config";
import { Member } from "../libs/types/member";
import { T } from "../libs/types/common";
import { ObjectId } from "mongoose";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import LikeService from "./Like.service";
import BookModel from "../schema/Book.model";
import { BookInput, BookInquiry, BookUpdateInput } from "../libs/types/book";
import { Book } from "../libs/types/book";
import { BookStatus } from "../libs/enums/book.enum";
import MemberService from "./Member.service";
import path from "path";
import fs from "fs";

class BookService {
  private readonly bookModel;
  public viewService;
  public likeService;
  public memberService;

  constructor() {
    this.bookModel = BookModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
    this.memberService = new MemberService();
  }

  public async createBook(input: BookInput): Promise<Book> {
    try {
      return await this.bookModel.create(input);
    } catch (err) {
      console.error("Error, model:createBook", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async getBook(memberId: ObjectId | null, id: string): Promise<Book> {
    const targetId = shapeIntoMongooseObjectId(id);

    let result = await this.bookModel
      .findOne({ _id: targetId, book: BookStatus.PROCESS })
      .lean()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // Check Existence
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: targetId,
        viewGroup: ViewGroup.BOOK,
      };
      const existView = await this.viewService.checkViewExistence(input);

      console.log("exist:", !!existView);
      if (!existView) {
        // Insert View
        await this.viewService.insertMemberView(input);

        // Increase Counts
        result = await this.bookModel
          .findByIdAndUpdate(
            targetId,
            { $inc: { bookViews: +1 } },
            { new: true }
          )
          .lean()
          .exec();
      }

      const likeInput = {
        memberId: memberId,
        likeRefId: targetId,
        likeGroup: LikeGroup.MEMBER,
      };
      result.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    result.authorData = await this.memberService.getMember(
      null,
      result.memberId
    );

    return result;
  }

  public async getBooks(member: Member, inquiry: BookInquiry): Promise<Book[]> {
    const memberId = shapeIntoMongooseObjectId(member?._id);

    const match: T = { bookStatus: BookStatus.PROCESS };

    if (inquiry.bookCategory) match.bookCategory = inquiry.bookCategory;
    if (inquiry.search) {
      match.bookName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T = { [inquiry.order]: -1 };

    console.log(match);

    const result = await this.bookModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: "members",
            localField: "memberId",
            foreignField: "_id",
            as: "authorData",
          },
        },
        { $unwind: "$authorData" },
        lookupAuthMemberLiked(memberId),
      ])
      .exec();

    return result;
  }

  public async getMyBooks(member: Member): Promise<Book[]> {
    const memberId = shapeIntoMongooseObjectId(member?._id);

    return await this.bookModel.find({ memberId: memberId }).exec();
  }

  public async updateBook(
    member: Member,
    input: BookUpdateInput
  ): Promise<Book> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const oldBook = await this.bookModel
      .findOne({ _id: input._id, memberId: memberId })
      .exec();

    const result = await this.bookModel
      .findOneAndUpdate({ _id: input._id, memberId: memberId }, input, {
        new: true,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if (input.bookImages && input.bookImages.length > 0) {
      const currentImages = oldBook.bookImages || [];

      for (const oldImage of currentImages) {
        const oldImagePath = path.resolve(oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    return result;
  }

  public async deleteBook(member: Member, bookId: string): Promise<Book> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    bookId = shapeIntoMongooseObjectId(bookId);
    const result = await this.bookModel
      .findOneAndDelete(
        { _id: bookId, memberId: memberId },
        {
          new: true,
        }
      )
      .exec();
    if (!result) throw new Errors(HttpCode.BAD_REQUEST, Message.DELETE_FAILED);

    if (result.bookImages && result.bookImages.length > 0) {
      const currentImages = result.bookImages || [];

      for (const oldImage of currentImages) {
        const oldImagePath = path.resolve(oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    return result;
  }

  public async likeTargetBook(member: Member, id: string): Promise<Book> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const likeRefId = shapeIntoMongooseObjectId(id);

    const target: Book = await this.bookModel
      .findOne({ _id: likeRefId, bookStatus: BookStatus.PROCESS })
      .exec();
    if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.BOOK,
    };

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.bookStatsEditor({
      _id: likeRefId,
      targetKey: "bookLikes",
      modifier: modifier,
    });
    if (!target)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    return result;
  }

  public async bookStatsEditor(input: any): Promise<Book> {
    const { _id, targetKey, modifier } = input;
    return await this.bookModel
      .findByIdAndUpdate(
        _id,
        {
          $inc: { [targetKey]: modifier },
        },
        { new: true }
      )
      .exec();
  }

  /** ADMIN API */
  public async getAllBooks(): Promise<Book[]> {
    const result = await this.bookModel.find().sort({ createdAt: -1 }).exec();

    return result;
  }

  public async removeBook(bookId: string): Promise<Book> {
    bookId = shapeIntoMongooseObjectId(bookId);
    const result = await this.bookModel
      .findOneAndDelete(
        { _id: bookId },
        {
          new: true,
        }
      )
      .exec();
    if (!result) throw new Errors(HttpCode.BAD_REQUEST, Message.DELETE_FAILED);

    if (result.bookImages && result.bookImages.length > 0) {
      const currentImages = result.bookImages || [];

      for (const oldImage of currentImages) {
        const oldImagePath = path.resolve(oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    return result;
  }
}

export default BookService;
