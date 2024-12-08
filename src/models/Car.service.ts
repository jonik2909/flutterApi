import Errors, { HttpCode } from "../libs/Errors";
import CarModel from "../schema/Car.model";
import { Message } from "../libs/Errors";
import { Car, CarInput } from "../libs/types/car";

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
}

export default CarService;
