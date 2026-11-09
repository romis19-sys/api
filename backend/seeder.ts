import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./src/models/product.model";
import User, { IUser } from "./src/models/user.model";
import users from "./data/users";
import products from "./data/products";

dotenv.config();

const importData = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  await Product.deleteMany({});
  await User.deleteMany({});
  console.log("Colecciones limpiadas");

  let adminUser: IUser;
  for (const u of users) {
    const newUser = new User(u);
    const savedUser = await newUser.save();
    if (savedUser.isAdmin) {
      adminUser = savedUser;
    }
  }
  const productsWithUser = products.map((produc) => {
    return {
      ...produc,
      user: adminUser._id,
    };
  });
  await Product.insertMany(productsWithUser);
  console.log("Seed aplicado correctamente");
  process.exit(0);
};

const destroyData = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  await Product.deleteMany({});
  await User.deleteMany({});
  console.log("Colecciones limpiadas");
  process.exit(0);
};
if (process.argv.includes("d")) {
  destroyData();
} else {
  importData();
}
