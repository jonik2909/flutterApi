import { BookCategory, BookStatus } from "../enums/book.enum";
import { ObjectId, Types } from "mongoose";

export interface Book {
  _id: ObjectId;
  bookName: string;
  bookPrice: number;
  bookDesc: string;
  bookImages: string[];
  bookCategory: BookCategory;
  bookStatus: BookStatus;
  bookViews: number;
  bookLikes: number;
  memberId: ObjectId;
}

export interface BookInquiry {
  order: string;
  page: number;
  limit: number;
  bookCategory?: BookCategory;
  search?: string;
}

export interface BookInput {
  bookName: string;
  bookPrice: number;
  bookDesc: string;
  bookImages: string[];
  bookCategory: BookCategory;
  bookStatus?: BookStatus;
  memberId: ObjectId;
}

export interface BookUpdateInput {
  _id: ObjectId;
  bookName?: string;
  bookPrice?: number;
  bookDesc?: string;
  bookImages?: string[];
  bookCategory?: BookCategory;
  bookStatus?: BookStatus;
  bookViews?: number;
  bookLikes?: number;
  memberId?: ObjectId;
}
