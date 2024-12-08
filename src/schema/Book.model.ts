import mongoose, { Schema } from "mongoose";
import { BookCategory } from "../libs/enums/book.enum";

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

    bookImage: {
      type: String,
      required: true,
    },

    bookCategory: {
      type: String,
      enum: BookCategory,
      required: true,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
