"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services";
import { creatorService, CreatorProfile } from "@/services/creator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, X } from "lucide-react";

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EditProfileFormData {
  bio: string;
  subscriptionPrice: string;
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
    bio: "",
    subscriptionPrice: "",
  });

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
          bio: response.data.bio || "",
          subscriptionPrice: response.data.subscriptionPrice?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      // Fallback to session data if specific profile fetch fails
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!session?.user?.role) return;
      const role = session.user.role;
      const roleKey = role.toLowerCase();

      if (roleKey === 'creator') {
        const updatedData: any = {
          bio: editFormData.bio,
        };
        if (editFormData.subscriptionPrice) {
          updatedData.subscriptionPrice = parseFloat(editFormData.subscriptionPrice);
        }
        await creatorService.updateProfile(role, updatedData);
      }
      else if (roleKey === 'member') {
        const updatedData: any = {
          bio: editFormData.bio,
        };
        await creatorService.updateProfile(role, updatedData);
      }
      else if (roleKey === 'admin') {
        const updatedData: any = {
          bio: editFormData.bio,
        };
        await creatorService.updateProfile(role, updatedData);
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
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

  if (!session) return null;

  const displayUser = profile || {
    name: session.user.name,
    username: session.user.username,
    email: session.user.email,
    avatar: session.user.image,
    role: session.user.role,
    bio: null,
    createdAt: new Date().toISOString(), // Fallback
    _count: { followers: 0, subscribers: 0, createdStreams: 0 }
  };

  const isCreator = session.user.role?.toLowerCase() === 'creator';
  const isMember = session.user.role?.toLowerCase() === 'member';
  const isAdmin = session.user.role?.toLowerCase() === 'admin';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-4xl mx-auto min-h-[calc(81vh)]">
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
              <UserAvatar
                src={displayUser.avatar || null}
                name={displayUser.name || "User"}
                className="w-24 h-24 text-2xl"
              />
            )}
            {/* Future: Add avatar upload trigger here */}
          </div>

          <div className="flex-1 space-y-2 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayUser.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">@{displayUser.username}</p>
              </div>

              {!isAdmin && (
                !isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      size="sm"
                      disabled={isSaving}
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
            <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100">
              {displayUser.email}
            </div>
          </div>

          {isCreator && (
            <div>
              <Label htmlFor="subscriptionPrice">Monthly Subscription Price ($)</Label>
              {isEditing ? (
                <Input
                  id="subscriptionPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.subscriptionPrice}
                  onChange={(e) => setEditFormData({ ...editFormData, subscriptionPrice: e.target.value })}
                  className="mt-1"
                  placeholder="0.00"
                />
              ) : (
                <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100">
                  {profile?.subscriptionPrice ? `$${profile.subscriptionPrice}` : 'Not set'}
                </div>
              )}
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
