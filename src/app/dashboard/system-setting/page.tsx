"use client";

import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";

interface AdminFormData {
  name: string;
  mobile: string;
  email: string;
  adminPhoto?: string | string[] | null;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  const { data: session, status } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const { register: profileRegister, handleSubmit: handleProfileSubmit, setValue: setProfileValue, formState: { errors: profileErrors } } = useForm<AdminFormData>();
  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm<PasswordFormData>();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutorial");
  const [adminPhoto, setAdminPhoto] = useState<string | null>(null);

  const tutorialData = {
    title: "How to Use the Admin Dashboard",
    youtubeVideo: "https://www.youtube.com/embed/MlubS7KX0YQ?si=HxpY2lbkoRria5ag",
    description: "This tutorial will guide you through all the features of the admin dashboard. Learn how to manage users, settings, and other important functions."
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      if (status === "loading") return; // Don't fetch if session is loading
      if (!session?.user?.id) {
        console.error("No user session found");
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/users/${session.user.id}`);
        const adminData = res.data;
        
        setProfileValue("name", adminData.name);
        setProfileValue("mobile", adminData.mobile);
        setProfileValue("email", adminData.email);
        setAdminPhoto(adminData.profilePhoto || adminData.adminPhoto);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [session, status, setProfileValue]);

  const onSubmitProfile = async (data: AdminFormData) => {
    if (!session?.user?.id) {
      toast.error("User session not found");
      return;
    }

    setLoadingProfile(true);
    try {
      await axios.put(`/api/users/${session.user.id}`, {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        profilePhoto: adminPhoto
      });
      toast.success("Profile updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast.error(axiosError.response?.data?.error || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!session?.user?.id) {
      toast.error("User session not found");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoadingPassword(true);
    try {
      await axios.put(`/api/users/${session.user.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password updated successfully!");
      resetPasswordForm();
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast.error(axiosError.response?.data?.error || "Failed to update password");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setAdminPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-rajdhani">Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-600 font-rajdhani">Please sign in to access system settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-orbitron uppercase tracking-wider">System Settings</h1>
            <p className="text-sm text-gray-600 mt-2 font-rajdhani">Manage your business profile, security, and system configuration</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("tutorial")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm font-rajdhani ${activeTab === "tutorial" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Tutorial
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm font-rajdhani ${activeTab === "profile" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm font-rajdhani ${activeTab === "password" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Password
              </button>
            </nav>
          </div>

          {activeTab === "tutorial" && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-orbitron uppercase tracking-wide">{tutorialData.title}</h2>
                <p className="mt-3 text-base text-gray-600 font-rajdhani">
                  Watch this comprehensive tutorial to master the admin dashboard features
                </p>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 shadow-lg">
                  <iframe
                    className="w-full h-96 rounded-xl shadow-lg border-2 border-white"
                    src={tutorialData.youtubeVideo}
                    title="Admin Dashboard Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 font-rajdhani uppercase tracking-wide">Tutorial Overview</h3>
                  <p className="text-gray-700 font-rajdhani text-base leading-relaxed">{tutorialData.description}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-orbitron uppercase tracking-wide">Profile Management</h2>
                  <p className="mt-3 text-base text-gray-600 font-rajdhani">
                    {isEditMode ? "Update your personal information and business details" : "View your current profile information"}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="inline-flex items-center px-6 py-3 text-base font-bold rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-rajdhani uppercase tracking-wide"
                >
                  {isEditMode ? "Cancel Edit" : "Edit Profile"}
                </button>
              </div>

              <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      {adminPhoto ? (
                        <img src={adminPhoto} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-gray-600 font-rajdhani font-bold">No Photo</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 shadow-lg">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {isEditMode && (
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:transition-all file:duration-200 file:shadow-md hover:file:shadow-lg cursor-pointer font-rajdhani"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...profileRegister("name", { required: "Name is required" })}
                      disabled={!isEditMode}
                      className={`w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 font-rajdhani text-base ${
                        !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                      } ${profileErrors.name ? "border-orange-500" : "border-gray-300"}`}
                      placeholder="Enter your full name"
                    />
                    {profileErrors.name && (
                      <p className="mt-2 text-sm text-orange-600 font-rajdhani">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">
                      Mobile Number *
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      {...profileRegister("mobile", { required: "Mobile is required" })}
                      disabled={!isEditMode}
                      className={`w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 font-rajdhani text-base ${
                        !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                      } ${profileErrors.mobile ? "border-orange-500" : "border-gray-300"}`}
                      placeholder="Enter your mobile number"
                    />
                    {profileErrors.mobile && (
                      <p className="mt-2 text-sm text-orange-600 font-rajdhani">{profileErrors.mobile.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...profileRegister("email", { required: "Email is required" })}
                    disabled={!isEditMode}
                    className={`w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 font-rajdhani text-base ${
                      !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                    } ${profileErrors.email ? "border-orange-500" : "border-gray-300"}`}
                    placeholder="Enter your email address"
                  />
                  {profileErrors.email && (
                    <p className="mt-2 text-sm text-orange-600 font-rajdhani">{profileErrors.email.message}</p>
                  )}
                </div>

                {isEditMode && (
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loadingProfile}
                      className="inline-flex items-center px-8 py-4 text-base font-bold rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-rajdhani uppercase tracking-wide disabled:opacity-50"
                    >
                      {loadingProfile ? (
                        <>
                          <svg className="w-5 h-5 mr-3 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : "Update Profile"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-orbitron uppercase tracking-wide">Password Security</h2>
                <p className="mt-3 text-base text-gray-600 font-rajdhani">
                  Update your password to keep your account secure
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-6 max-w-md">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">
                    Current Password *
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    {...passwordRegister("currentPassword", { required: "Current password is required" })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 font-rajdhani text-base"
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-2 text-sm text-orange-600 font-rajdhani">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">
                    New Password *
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    {...passwordRegister("newPassword", { 
                      required: "New password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" }
                    })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 font-rajdhani text-base"
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-orange-600 font-rajdhani">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-800 mb-2 font-rajdhani">
                    Confirm New Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...passwordRegister("confirmPassword", { required: "Please confirm your password" })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 font-rajdhani text-base"
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-orange-600 font-rajdhani">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="inline-flex items-center px-8 py-4 text-base font-bold rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-rajdhani uppercase tracking-wide disabled:opacity-50"
                  >
                    {loadingPassword ? (
                      <>
                        <svg className="w-5 h-5 mr-3 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <Toaster position="top-center" />
      </div>
    </div>
  );
};

export default Settings;