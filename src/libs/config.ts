export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = `:method :url :response-time [:status] \n`;

import mongoose from "mongoose";
import { T } from "./types/common";
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

export const lookupAuthMemberLiked = (
  memberId: T,
  targetRefId: string = "$_id"
) => {
  return {
    $lookup: {
      from: "likes",
      let: {
        localLikeRefId: targetRefId,
        localMemberId: memberId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$likeRefId", "$$localLikeRefId"] },
                { $eq: ["$memberId", "$$localMemberId"] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: "$$localMyFavorite",
          },
        },
      ],
      as: "meLiked",
    },
  };
};
