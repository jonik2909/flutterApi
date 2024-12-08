import { MemberInput } from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import MemberModel from "../schema/Member.model";
import { Member } from "../libs/types/member";
import * as bcrypt from "bcryptjs";

class MemberService {
  private readonly memberModel;

  constructor() {
    this.memberModel = MemberModel;
  }

  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    console.log(input);

    try {
      const result = await this.memberModel.create(input);
      const member: Member = result.toObject();
      member.memberPassword = "";

      return member;
    } catch (err) {
      console.error("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }
}

export default MemberService;
