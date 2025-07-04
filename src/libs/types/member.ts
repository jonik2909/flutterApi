import { ObjectId, Types } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Request } from "express";
import { meLiked } from "./like";
import { Book } from "./book";

export interface Member {
  _id: ObjectId;
  memberNick: string;
  memberPassword?: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberEmail: string;
  memberDesc?: string;
  memberImage?: string;
  memberViews: number;
  memberLikes: number;
  createdAt: Date;
  updatedAt: Date;
  meLiked?: meLiked[];
  bookData?: Book[];
}

export interface MemberInquiry {
  order: string;
  page: number;
  limit: number;
  memberType?: MemberType;
  search?: string;
}

export interface MemberInput {
  memberNick: string;
  memberPassword: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberEmail: string;
  memberDesc?: string;
  memberImage?: string;
}

export interface LoginInput {
  memberNick: string;
  memberEmail: string;
  memberPassword: string;
}

export interface MemberUpdateInput {
  _id: ObjectId;
  memberNick?: string;
  memberPassword?: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberEmail?: string;
  memberDesc?: string;
  memberImage?: string;
  memberViews?: number;
  memberLikes?: number;
}

export interface ExtendedRequest extends Request {
  member: Member;
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
