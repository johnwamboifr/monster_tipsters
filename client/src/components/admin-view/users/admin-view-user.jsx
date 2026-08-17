/** @format */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

import { fetchSingleUser } from "@/features/slices/usersSlice";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  User,
  Mail,
  Phone,
  Crown,
  Calendar,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Clock3,
  Globe,
  Activity,
} from "lucide-react";

const AdminViewUser = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, status, error } = useSelector(
    (state) => state.users
  );

  useEffect(() => {
    dispatch(fetchSingleUser(userId));
  }, [dispatch, userId]);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
              <div className="h-24 bg-muted/40" />

              <div className="-mt-10 flex flex-col gap-6 px-5 pb-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-end gap-4">
                  <Skeleton className="h-20 w-20 rounded-3xl border-4 border-background" />

                  <div className="space-y-3 pb-1">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-7 w-52 rounded-full" />
                    <Skeleton className="h-4 w-36 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-border/70 bg-background p-4"
                    >
                      <Skeleton className="mx-auto h-3 w-16 rounded-full" />
                      <Skeleton className="mx-auto mt-3 h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content skeleton */}
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <Card className="rounded-[28px]">
                <CardHeader>
                  <Skeleton className="h-6 w-48 rounded-full" />
                  <Skeleton className="mt-2 h-4 w-72 rounded-full" />
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                      >
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="mt-4 h-5 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px]">
                <CardHeader>
                  <Skeleton className="h-6 w-40 rounded-full" />
                </CardHeader>

                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="mt-3 h-4 w-full rounded-full" />
                      <Skeleton className="mt-2 h-4 w-2/3 rounded-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (status === "rejected") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md rounded-[28px] border-red-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <User className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-foreground">
              Failed to Load User
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <Button
              onClick={() =>
                dispatch(fetchSingleUser(userId))
              }
              variant="outline"
              className="mt-6 rounded-full px-6"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payments = user?.payments || [];
  const isVip = user?.userType === "vip";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">

          {/* =====================================================
              USER HEADER
          ===================================================== */}

          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-card shadow-sm">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

            <div className="-mt-10 flex flex-col gap-6 px-5 pb-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-background bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="pb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Account overview
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {user?.name || "Unknown User"}
                  </h1>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Role
                  </p>
                  <p className="mt-2 text-sm font-bold capitalize text-foreground">
                    {user?.userType || "Client"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {user?.verified ? "Verified" : "Unverified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Payments
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {payments.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Joined
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {user?.createdAt
                      ? moment(user.createdAt).format("MMM D, YYYY")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 GOES HERE */}
                    {/* =====================================================
              PROFILE + PAYMENT CONTENT
          ===================================================== */}

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

            {/* ===================================================
                PROFILE INFORMATION
            =================================================== */}

            <Card className="rounded-[30px] border-border/70 bg-card shadow-sm">
              <CardHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>

                      <CardTitle className="text-lg sm:text-xl">
                        Profile Information
                      </CardTitle>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Key account details and login metadata
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="w-fit rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {/* FULL NAME */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Full Name
                      </p>
                    </div>

                    <p className="mt-4 break-words text-sm font-semibold text-foreground">
                      {user?.name || "Not provided"}
                    </p>
                  </div>

                  {/* EMAIL */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </p>
                    </div>

                    <p className="mt-4 break-all text-sm font-semibold text-foreground">
                      {user?.email || "Not provided"}
                    </p>
                  </div>

                  {/* PHONE */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Phone
                      </p>
                    </div>

                    <p className="mt-4 break-words text-sm font-semibold text-foreground">
                      {user?.phoneNumber || "Not provided"}
                    </p>
                  </div>

                  {/* ACCOUNT TYPE */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Crown className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Account Type
                      </p>
                    </div>

                    <div className="mt-4">
                      <Badge
                        variant={isVip ? "default" : "outline"}
                        className={
                          isVip
                            ? "border-yellow-400 bg-yellow-500 text-white"
                            : ""
                        }
                      >
                        {user?.userType?.toUpperCase() || "CLIENT"}
                      </Badge>
                    </div>
                  </div>

                  {/* MEMBER SINCE */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Member Since
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-foreground">
                      {user?.createdAt
                        ? moment(user.createdAt).format("MMM D, YYYY")
                        : "N/A"}
                    </p>
                  </div>

                  {/* LAST LOGIN */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Last Logged In
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-foreground">
                      {user?.lastLoginAt
                        ? moment(user.lastLoginAt).format(
                            "MMM D, YYYY • h:mm A"
                          )
                        : "Never"}
                    </p>
                  </div>

                  {/* LAST LOGIN IP */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Last Login IP
                      </p>
                    </div>

                    <p className="mt-4 break-all text-sm font-semibold text-foreground">
                      {user?.lastLoginIp || "N/A"}
                    </p>
                  </div>

                  {/* USER AGENT */}
                  <div className="group rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        User Agent
                      </p>
                    </div>

                    <p className="mt-4 break-all text-sm font-semibold text-foreground">
                      {user?.lastLoginUserAgent || "N/A"}
                    </p>
                  </div>

                  {/* VIP EXPIRES */}
                  {isVip && (
                    <div className="group rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4 transition hover:bg-yellow-500/[0.07]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10">
                          <Calendar className="h-4 w-4 text-yellow-600" />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          VIP Expires
                        </p>
                      </div>

                      <p className="mt-4 text-sm font-bold text-foreground">
                        {user?.accessExpiration
                          ? moment(user.accessExpiration).format(
                              "MMM D, YYYY"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* ===================================================
                PAYMENT HISTORY
            =================================================== */}

            <Card className="rounded-[30px] border-border/70 bg-card shadow-sm">
              <CardHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <CardTitle className="text-lg sm:text-xl">
                      Payment History
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {payments.length} payment
                      {payments.length === 1 ? "" : "s"} recorded
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">

                {payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-foreground">
                      No payment history available
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Payment transactions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/20 hover:bg-muted/30"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-bold text-foreground">
                                Ksh {p.amount || "0"}
                              </p>

                              <p className="mt-1 break-all text-xs text-muted-foreground">
                                Ref: {p.reference || "N/A"}
                              </p>

                              {p.mpesaReceiptNumber && (
                                <p className="mt-1 break-all text-xs text-muted-foreground">
                                  Receipt:{" "}
                                  {p.mpesaReceiptNumber}
                                </p>
                              )}
                            </div>

                            <Badge
                              variant={
                                p.status === "completed"
                                  ? "default"
                                  : p.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="shrink-0"
                            >
                              {p.status?.toUpperCase() ||
                                "UNKNOWN"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />

                            {moment(p.createdAt).format(
                              "MMM D, YYYY • h:mm A"
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* SECTION 3 GOES HERE */}
          {/* =====================================================
              ACCOUNT SUMMARY
          ===================================================== */}

          <Card className="overflow-hidden rounded-[30px] border-border/70 bg-card shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    {isVip ? (
                      <Crown className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Account status
                    </p>

                    <p className="mt-1 text-base font-semibold text-foreground">
                      {isVip
                        ? "VIP account"
                        : "Standard account"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      user?.verified
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                    }
                  >
                    {user?.verified
                      ? "Verified"
                      : "Unverified"}
                  </Badge>

                  {isVip && (
                    <Badge className="border-yellow-400 bg-yellow-500 text-white">
                      VIP
                    </Badge>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AdminViewUser;
          
          
