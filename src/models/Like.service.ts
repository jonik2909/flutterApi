import LikeModel from "../schema/Like.model";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { View, ViewInput } from "../libs/types/view";
import ViewModel from "../schema/View.model";
import { LikeInput } from "../libs/types/like";
import { T } from "../libs/types/common";

class LikeService {
  private readonly likeModel;

  constructor() {
    this.likeModel = LikeModel;
  }

  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
      exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;

    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (err: any) {
        console.log("Error, Service.model:", err?.message);
        throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
      }
    }

    console.log(`- Like modifier ${modifier} -`);
    return modifier;
  }

  // public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
  // 	const { memberId, likeRefId } = input;
  // 	const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
  // 	return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
  // }
}

export default LikeService;
