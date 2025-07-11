import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  bio?: string;
  photos?: string[];
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  matches: mongoose.Types.ObjectId[];
}

const ProfileSchema = new Schema<IProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String },
  photos: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
export default Profile;
