import {
  LoginInput,
  MemberInput,
  MemberInquiry,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import {
  lookupAuthMemberLiked,
  shapeIntoMongooseObjectId,
} from "../libs/config";
import MemberModel from "../schema/Member.model";
import { Member } from "../libs/types/member";
import * as bcrypt from "bcryptjs";
import { MemberStatus } from "../libs/enums/member.enum";
import { T } from "../libs/types/common";
import { ObjectId } from "mongoose";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import LikeService from "./Like.service";

class MemberService {
  private readonly memberModel;
  public viewService;
  public likeService;

  constructor() {
    this.memberModel = MemberModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
  }

  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toJSON();
    } catch (err) {
      console.error("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        {
          memberNick: input.memberNick,
          memberStatus: { $ne: MemberStatus.DELETE },
        },
        { memberNick: 1, memberPassword: 1, memberStatus: 1 }
      )
      .exec();

    console.log(input);

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    else if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    return await this.memberModel.findById(member._id).lean().exec();
  }

  public async getMember(
    memberId: ObjectId | null,
    id: string
  ): Promise<Member> {
    const targetId = shapeIntoMongooseObjectId(id);

    let result = await this.memberModel
      .findOne({ _id: targetId, memberStatus: MemberStatus.ACTIVE })
      .lean()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // Check Existence
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: targetId,
        viewGroup: ViewGroup.MEMBER,
      };
      const existView = await this.viewService.checkViewExistence(input);

      console.log("exist:", !!existView);
      if (!existView) {
        // Insert View
        await this.viewService.insertMemberView(input);

        // Increase Counts
        result = await this.memberModel
          .findByIdAndUpdate(
            targetId,
            { $inc: { memberViews: +1 } },
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

      console.log("result:", result);

      console.log(
        "liked:",
        await this.likeService.checkLikeExistence(likeInput)
      );
    }

    return result;
  }

  public async getMembers(
    member: Member,
    inquiry: MemberInquiry
  ): Promise<Member[]> {
    const memberId = shapeIntoMongooseObjectId(member?._id);

    const match: T = { memberStatus: MemberStatus.ACTIVE };

    if (inquiry.memberType) match.memberType = inquiry.memberType;
    if (inquiry.search) {
      match.memberNick = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T = { [inquiry.order]: -1 };

    console.log(match);

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        lookupAuthMemberLiked(memberId),
      ])
      .exec();

    return result;
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOneAndUpdate({ _id: memberId }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async likeTargetMember(member: Member, id: string): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const likeRefId = shapeIntoMongooseObjectId(id);

    const target: Member = await this.memberModel
      .findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE })
      .exec();
    if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.MEMBER,
    };

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.memberStatsEditor({
      _id: likeRefId,
      targetKey: "memberLikes",
      modifier: modifier,
    });
    if (!target)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    return result;
  }

  public async memberStatsEditor(input: any): Promise<Member> {
    const { _id, targetKey, modifier } = input;
    return await this.memberModel
      .findByIdAndUpdate(
        _id,
        {
          $inc: { [targetKey]: modifier },
        },
        { new: true }
      )
      .exec();
  }
}

export default MemberService;
