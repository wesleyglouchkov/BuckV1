"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import Link from "next/link";
import { authService } from "@/services";
import { creatorService, CreatorProfile } from "@/services/creator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, X } from "lucide-react";
import ProfileImageUpload from "@/components/profile-image-upload";

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EditProfileFormData {
  name: string;
  username: string;
  bio: string;
}

export default function UserProfile() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState<ChangePasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<EditProfileFormData>({
    name: "",
    username: "",
    bio: "",
  });

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session?.user?.email]);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      if (!session?.user?.role) return;

      const response = await creatorService.getUserProfile(session.user.role);
      if (response && response.data) {
        setProfile(response.data);
        setEditFormData({
          name: response.data.name || "",
          username: response.data.username || "",
          bio: response.data.bio || "",
        });

        // Update session avatar if it differs from the fetched profile
        if (response.data.avatar && response.data.avatar !== session.user.avatar) {
          await updateSession({
            user: {
              avatar: response.data.avatar
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      // Fallback to session data if specific profile fetch fails
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Debounced username check
  const checkUsername = useCallback(async (username: string) => {
    if (!session?.user?.role) return;

    // Reset states
    setUsernameError(null);
    setUsernameAvailable(null);

    // Validate locally first
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Only letters, numbers, and underscores allowed");
      return;
    }

    // If same as current username, it's available
    if (profile?.username && username.toLowerCase() === profile.username.toLowerCase()) {
      setUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const result = await creatorService.checkUsernameAvailability(session.user.role, username);
      setUsernameAvailable(result.available);
      if (!result.available) {
        setUsernameError("Username is already taken");
      }
    } catch (error: any) {
      setUsernameError(error.message || "Failed to check username");
    } finally {
      setIsCheckingUsername(false);
    }
  }, [session?.user?.role, profile?.username]);

  // Debounce username check effect
  useEffect(() => {
    if (!isEditing) return;

    const timer = setTimeout(() => {
      if (editFormData.username && editFormData.username !== profile?.username) {
        checkUsername(editFormData.username);
      } else if (editFormData.username === profile?.username) {
        setUsernameError(null);
        setUsernameAvailable(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editFormData.username, isEditing, checkUsername, profile?.username]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before saving
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    if (editFormData.name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setIsSaving(true);

    try {
      if (!session?.user?.role) return;
      const role = session.user.role;

      const updatedData: any = {
        name: editFormData.name,
        username: editFormData.username,
        bio: editFormData.bio,
      };

      await creatorService.updateProfile(role, updatedData);

      // Update session with new name/username
      await updateSession({
        user: {
          name: editFormData.name,
          username: editFormData.username,
        }
      });

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = async (newKey: string) => {
    if (!session?.user?.role) return;

    try {
      // Update profile with new avatar key
      await creatorService.updateProfile(session.user.role, { avatar: newKey });

      // Update session
      await updateSession({
        user: {
          avatar: newKey
        }
      });

      // Refresh profile to get the updated data
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile image");
    }
  };

  const handleProfileImageDelete = async () => {
    if (!session?.user?.role) return;

    try {
      // Update profile with null avatar
      await creatorService.updateProfile(session.user.role, { avatar: "" });

      // Update session
      await updateSession({
        user: {
          avatar: ""
        }
      });

      // Refresh profile
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile image");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const response = await authService.changePassword({
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.newPassword,
      }, session.user.role);

      toast.success(response.message || "Password changed successfully");
      setPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
    } catch (error: any) {
      let errorMessage = "Failed to change password";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
      }
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const resetForm = () => {
    setPasswordFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePassword(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setUsernameError(null);
    setUsernameAvailable(null);
    // Reset form to current profile values
    if (profile) {
      setEditFormData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
      });
    }
  };

  if (!session) return null;

  const displayUser = profile || {
    name: session.user.name,
    username: (session.user as any).username,
    email: session.user.email,
    avatar: (session.user as any).avatar,
    role: (session.user as any).role,
    bio: null,
    createdAt: new Date().toISOString(), // Fallback
    _count: { followers: 0, subscribers: 0, createdStreams: 0 }
  };

  const isCreator = session.user.role?.toLowerCase() === 'creator';
  const isMember = session.user.role?.toLowerCase() === 'member';
  const isAdmin = session.user.role?.toLowerCase() === 'admin';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md max-w-4xl mx-auto min-h-[calc(81vh)]">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative group">
            {isAdmin ? (
              <UserAvatar
                src={'/Wesley.jpg'}
                name={displayUser.name || "User"}
                className="w-24 h-24 text-2xl"
                size="xl"
              />
            ) : (
              <ProfileImageUpload
                currentImageKey={displayUser.avatar}
                userName={displayUser.name || "User"}
                size="xl"
                onUploadComplete={handleProfileImageUpload}
                onDeleteComplete={handleProfileImageDelete}
                onUploadError={(error) => toast.error(error)}
                disabled={isAdmin}
              />
            )}
          </div>

          <div className="flex-1 space-y-2 w-full">
            <div className="flex justify-between items-start">
              {isEditing && !isAdmin ? (
                <div className="space-y-3 flex-1 mr-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Your name"
                      className="mt-1"
                      minLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Input
                        id="username"
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value.toLowerCase() })}
                        placeholder="username"
                        className={`mt-1 ${usernameError ? 'border-red-500' : usernameAvailable ? 'border-green-500' : ''}`}
                        minLength={3}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5">
                        {isCheckingUsername && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        {!isCheckingUsername && usernameAvailable && <Check className="w-4 h-4 text-green-500" />}
                        {!isCheckingUsername && usernameError && <X className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayUser.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">@{displayUser.username}</p>
                </div>
              )}

              {!isAdmin && (
                !isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      size="sm"
                      disabled={isSaving || !!usernameError}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Badge variant={isCreator ? 'default' : 'secondary'} className="capitalize">
                  {session.user.role?.toLowerCase() || 'Member'}
                </Badge>
              </span>
              <span>Joined {new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>

            {!isAdmin && (
              !isEditing ? (
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  {displayUser.bio || "No bio provided"}
                </p>
              ) : (
                <div className="mt-4">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="mt-1 dark:text-white"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid (Creator Only) */}
      {isCreator && profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b border-gray-200 dark:border-gray-700">
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Followers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {profile._count?.followers || 0}
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Subscribers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {profile._count?.subscribers || 0}
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Streams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {profile._count?.createdStreams || 0}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid (Member Only) */}
      {isMember && profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b border-gray-200 dark:border-gray-700">
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {profile._count?.subscriptions || 0}
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Following</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {profile._count?.following || 0}
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-red-500 uppercase tracking-wider font-semibold">Warnings</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {profile.isWarnedTimes || 0}
            </p>
          </div>
        </div>
      )}

      {/* Additional Details & Settings */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Email Address</Label>
            <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              {displayUser.email}
            </div>
          </div>

          {isCreator && (
            <div>
              <Label>Monthly Subscription Price ($)</Label>
              <div className="mt-1 flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile?.subscriptionPrice ? `$${profile.subscriptionPrice}` : 'Not set'}
                </span>
                <Link
                  href="/creator/community"
                  className="text-xs text-primary hover:underline font-semibold uppercase tracking-wider"
                >
                  Manage the subscription price
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Change Password
            </h3>
            {!showChangePassword && (
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="outline"
                size="sm"
              >
                Change Password
              </Button>
            )}
          </div>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Current Password
                </label>
                <Input
                  id="oldPassword"
                  type="password"
                  required
                  value={passwordFormData.oldPassword}
                  onChange={(e) =>
                    setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })
                  }
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={6}
                  value={passwordFormData.newPassword}
                  onChange={(e) =>
                    setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })
                  }
                  placeholder="Enter your new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={passwordFormData.confirmPassword}
                  onChange={(e) =>
                    setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
