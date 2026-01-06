import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  image?: string;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  house?: string;
  matchPassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: "/uploads/default-avatar.png" },
    phone: { type: String },
    country: { type: String },
    city: { type: String },
    street: { type: String },
    house: { type: String },
  },
  { timestamps: true }
);

// ИСПРАВЛЕНИЕ: Убираем next и используем просто async функцию
userSchema.pre<IUser>("save", async function (this: IUser) {
  // Если пароль не был изменен, выходим из функции
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    // В асинхронных функциях ошибки выбрасываются через throw
    throw error;
  }
});

userSchema.methods.matchPassword = async function (
  this: IUser,
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
