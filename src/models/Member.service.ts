import { LoginInput, MemberInput, MemberInquiry } from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import MemberModel from "../schema/Member.model";
import { Member } from "../libs/types/member";
import * as bcrypt from "bcryptjs";
import { MemberStatus } from "../libs/enums/member.enum";
import { T } from "../libs/types/common";

class MemberService {
  private readonly memberModel;

  constructor() {
    this.memberModel = MemberModel;
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

  public async getMember(member: Member, targetId: string): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member?._id);
    targetId = shapeIntoMongooseObjectId(targetId);
    const result = await this.memberModel
      .findOne({ _id: targetId, memberStatus: MemberStatus.ACTIVE })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getMembers(inquiry: MemberInquiry): Promise<Member[]> {
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
      ])
      .exec();

    return result;
  }
}

export default MemberService;
