import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
  generateAuthToken: () => Promise<string>;
}

// 2️⃣ Define the Static Method Interface
export interface IUserModel extends Model<IUser> {
  findByCredentials: (email: string, password: string) => Promise<IUser>;
}
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password:{type:  String, required: true},
    gender: { type: String, enum:["male", "female", "other"], required: true },
    role: {
      name: { type: String, default: "User" },
    },
    location: {type: String, required: true},
    tokens: [{ token: { type: String, required: true } }],
    dob: { type: Date, required: [true, 'Date of birth is required'] },
    preference: {type: String, enum:["men", "women", "everyone"], required: true},
    bio: { type: String, default: "" },
    interests: { type: [String], default: [] },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", async function (next: () => void) {
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);  
  }
  next();
});

/**
 * Hide properties of Mongoose User object.
 */
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  if (userObject.role !== "superadmin") {
    delete userObject.updatedAt;
    delete userObject.__v;
  }
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

/**
 * Helper method for generating Auth Token
 */
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  try {
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    user.tokens = [{ token }];

    await user.save(); 

    return token;
  } catch (error) {
    console.error("Error saving user:", error);
    throw new Error("Failed to generate token");
  }
};

/**
 * Helper static method for finding user by credentials
 */
userSchema.statics.findByCredentials = async function (
  email: string,
  password: string
) {
  const User = this;
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login");
  
  const isMatch = await bcrypt.compare(password, user.password);
  console.log(password,"Password", user.password)
  if (!isMatch) throw new Error("Unable to login");
  return user;
};
const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
