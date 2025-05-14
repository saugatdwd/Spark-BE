import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    // MongoDB setup
    await mongoose.connect(process.env.MONGODB_URI as string);

    console.log(chalk.green("MongoDB connected successfully!"));
  } catch (e: any) {
    console.error(e.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
