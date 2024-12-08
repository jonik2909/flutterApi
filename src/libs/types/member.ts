import { ObjectId, Types } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Request } from "express";
import { Session } from "express-session";

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
