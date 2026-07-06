import { useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import type { User } from "@/types";

const DEFAULT_AVATAR = "/uploads/default-avatar.png";

function formDataFromUser(user: User) {
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    country: user.country || "",
    city: user.city || "",
    street: user.street || "",
    house: user.house || "",
    password: "",
    image: user.image || DEFAULT_AVATAR,
  };
}

/**
 * Owns the settings page's form state: syncing from the logged-in user,
 * avatar upload/removal, password validation, and submit — leaves the page
 * to render the tabs/fields.
 */
export function useProfileSettingsForm() {
  const { user, updateProfile, isAuthLoading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    street: "",
    house: "",
    password: "",
    image: DEFAULT_AVATAR,
  });

  // Re-seeding the form whenever the store's `user` reference changes (login
  // completing, a save round-tripping) is a state *adjustment* in response
  // to a prop/store change, not a sync with an external system — doing it
  // during render (React's documented pattern for this) avoids the extra
  // render an effect would cost, and sidesteps the "no setState in effects"
  // purity rule.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) setFormData(formDataFromUser(user));
  }

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "U";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, image: DEFAULT_AVATAR }));
  };

  const changeTab = (value: string) => {
    setActiveTab(value);
    setFormData((prev) => ({ ...prev, password: "" }));
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password) {
      if (formData.password.length < 6) {
        return toast.error("Пароль должен быть не менее 6 символов");
      }
      if (formData.password !== confirmPassword) {
        return toast.error("Пароли не совпадают");
      }
    }

    try {
      await updateProfile(formData);
      toast.success("Данные успешно сохранены");
      setFormData((prev) => ({ ...prev, password: "" }));
      setConfirmPassword("");
    } catch (err) {
      toast.error("Ошибка при обновлении");
    }
  };

  const isCustomImage =
    formData.image && !formData.image.includes("default-avatar.png");

  return {
    user,
    isAuthLoading,
    fileInputRef,
    activeTab,
    changeTab,
    showPassword,
    setShowPassword,
    confirmPassword,
    setConfirmPassword,
    formData,
    setFormData,
    getInitials,
    handleImageUpload,
    removeAvatar,
    handleSubmit,
    isCustomImage,
  };
}
