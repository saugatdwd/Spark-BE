import mongoose from "mongoose";

const { Schema } = mongoose;

const userRoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    id: {type: String}
  });

const UserRole = mongoose.model("UserRole", userRoleSchema);
export default UserRole;