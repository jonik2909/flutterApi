import CarModel from "../schema/Car.model";

class CarService {
  private readonly carModel;

  constructor() {
    this.carModel = CarModel;
  }

  public async getCars() {
    return await this.carModel.find().exec();
  }
}

export default CarService;
