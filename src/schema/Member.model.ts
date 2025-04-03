import mongoose, { Schema } from "mongoose";
import { MemberStatus } from "../libs/enums/member.enum";
import { MemberType } from "../libs/enums/member.enum";

const memberSchema = new Schema(
  {
    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPassword: {
      type: String,
      select: false,
      required: true,
    },

    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberEmail: {
      type: String,
      index: { unique: true, sparse: true },
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberViews: {
      type: Number,
      default: 0,
    },

    memberLikes: {
      type: Number,
      default: 0,
    },

    memberBooks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
