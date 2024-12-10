import mongoose, { Schema } from "mongoose";
import { BookCategory, BookStatus } from "../libs/enums/book.enum";

const bookSchema = new Schema(
  {
    bookName: {
      type: String,
      required: true,
    },

    bookPrice: {
      type: Number,
      required: true,
    },

    bookDesc: {
      type: String,
      required: true,
    },

    bookImages: {
      type: [String],
      required: true,
    },

    bookCategory: {
      type: String,
      enum: BookCategory,
      required: true,
    },

    bookStatus: {
      type: String,
      enum: BookStatus,
      default: BookStatus.PROCESS,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    bookViews: {
      type: Number,
      default: 0,
    },

    bookLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
