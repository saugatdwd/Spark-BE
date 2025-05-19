export interface UserType {
  _id: string;
  name: string;
  email: string;
  password: string;
  gender?: string;
  dob: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
  location: string;
  preference: String;
  tokens?: { token: string }[];
  generateAuthToken: () => Promise<string>;
  save: () => Promise<void>;
  remove: () => Promise<void>;
  [key: string]: any;
}
