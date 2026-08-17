/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import { getUserProfile, updateProfile } from "@/features/slices/usersSlice";
import { loadUser } from "@/features/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaEdit,
  FaCrown,
} from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profileData, status } = useSelector((state) => state.users);
  const [openDialog, setOpenDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    dispatch(getUserProfile());
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (profileData?.user) {
      setEditName(profileData.user.name || "");
      setEditEmail(profileData.user.email || "");
      setEditPhone(profileData.user.phoneNumber || "");
    }
  }, [profileData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail || !editPhone) {
      toast.error("All fields are required.");
      return;
    }

    const result = await dispatch(
      updateProfile({
        formData: { name: editName, email: editEmail, phoneNumber: editPhone },
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully!");
      setOpenDialog(false);
      dispatch(getUserProfile());
    }
  };

  if (status === "pending") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md border border-border/70 bg-card/95 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto h-4 w-28" />
            <Skeleton className="mx-auto h-3 w-40" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">No profile data found.</p>
        <Button onClick={() => dispatch(getUserProfile())} size="sm" className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  const user = profileData.user;
  const initials = user.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const isVip = user.userType === "vip";

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="overflow-hidden border border-border/70 bg-card/95 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl font-semibold text-white shadow-lg">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                    Profile overview
                  </p>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {user.name || "Member"}
                  </h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={
                    isVip
                      ? "border-amber-400/20 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                      : "border-emerald-400/20 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                  }
                >
                  {isVip ? <FaCrown className="mr-1 h-3 w-3" /> : null}
                  {isVip ? "VIP Member" : "Standard Member"}
                </Badge>
                <Button onClick={() => setOpenDialog(true)} className="gap-2">
                  <FaEdit className="h-3.5 w-3.5" />
                  Edit profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-border/70 bg-card/95 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Personal details</p>
                  <p className="text-sm text-muted-foreground">
                    Keep your account information up to date.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Full Name", value: user.name, icon: FaUser },
                  { label: "Email", value: user.email, icon: FaEnvelope },
                  { label: "Phone", value: user.phoneNumber || "Not provided", icon: FaPhoneAlt },
                  {
                    label: "Member Since",
                    value: moment(user.createdAt).format("MMM YYYY"),
                    icon: FaCalendarAlt,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
                  >
                    <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/95 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-sm font-semibold text-foreground">Account status</p>
                <p className="text-sm text-muted-foreground">
                  Your access level and account activity.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Current plan</span>
                  <Badge
                    className={
                      isVip
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    }
                  >
                    {isVip ? "VIP" : "Standard"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isVip
                    ? "You have access to premium insights and priority updates."
                    : "Upgrade to unlock premium tips and exclusive content."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-primary/10 p-4">
                <p className="text-sm font-medium text-foreground">Need anything changed?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your profile details anytime and keep your account information accurate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm rounded-lg p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-foreground">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-2 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs text-foreground">
                Email
              </Label>
              <Input
                id="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs text-foreground">
                Phone
              </Label>
              <Input
                id="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={status === "pending"}>
                {status === "pending" ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
