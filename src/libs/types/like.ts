import { ObjectId, Types } from "mongoose";
import { LikeGroup } from "../enums/like.enum";

export interface LikeInput {
  memberId: ObjectId;
  likeRefId: ObjectId;
  likeGroup: LikeGroup;
}

export interface meLiked {
  memberId: ObjectId;
  likeRefId: ObjectId;
  myFavorite: boolean;
}
