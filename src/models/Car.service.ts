import Errors, { HttpCode } from "../libs/Errors";
import CarModel from "../schema/Car.model";
import { Message } from "../libs/Errors";
import { Car, CarInput, CarUpdateInput } from "../libs/types/car";
import { shapeIntoMongooseObjectId } from "../libs/config";

class CarService {
  private readonly carModel;

  constructor() {
    this.carModel = CarModel;
  }

  public async getCars() {
    return await this.carModel.find().exec();
  }

  public async createCar(input: CarInput): Promise<Car> {
    try {
      return await this.carModel.create(input);
    } catch (err) {
      console.error("Error, model:createCar:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateCar(input: CarUpdateInput): Promise<Car> {
    const carId = shapeIntoMongooseObjectId(input._id);
    const result = await this.carModel
      .findByIdAndUpdate({ _id: carId }, input, { new: true })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async deleteCar(id: string): Promise<Car> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.carModel
      .findByIdAndDelete({ _id: id }, { new: true })
      .exec();

    if (!result)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    return result;
  }
}

export default CarService;
