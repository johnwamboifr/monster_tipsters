/** @format */

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";

import { getAllPayments } from "@/features/slices/paymentSlice";
//import { getUserPayments } from "@/features/slices/paymentSlice";
import { setHeaders, url } from "@/features/slices/api";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FaSearch, FaEye, FaCheck, FaTimes } from "react-icons/fa";

const AdminPaymentsHistory = () => {
  const dispatch = useDispatch();

  const {
    list: payments = [],
    status,
    error,
  } = useSelector((state) => state.payments);

  const [filteredPayments, setFilteredPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllPayments());
  }, [dispatch]);

  useEffect(() => {
    let results = [...payments];

    if (statusFilter !== "all") {
      results = results.filter(
        (payment) =>
          String(payment.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();

      results = results.filter((payment) => {
        return (
          payment.phoneNumber
            ?.toLowerCase()
            .includes(term) ||
          payment.reference
            ?.toLowerCase()
            .includes(term) ||
          payment.planId
            ?.toLowerCase()
            .includes(term) ||
          payment.paymentMethod
            ?.toLowerCase()
            .includes(term) ||
          payment.network
            ?.toLowerCase()
            .includes(term) ||
          payment.user?.email
            ?.toLowerCase()
            .includes(term) ||
          payment.user?.name
            ?.toLowerCase()
            .includes(term)
        );
      });
    }

    setFilteredPayments(results);
  }, [payments, statusFilter, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return moment(dateString).format(
      "MMM D, YYYY • h:mm A"
    );
  };

  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(value);
  };

  const getStatusBadge = (statusValue) => {
    const normalized = String(
      statusValue || ""
    ).toLowerCase();

    const colorMap = {
      success:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",

      approved:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",

      pending:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",

      queued:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",

      processing:
        "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20",

      rejected:
        "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",

      failed:
        "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",

      cancelled:
        "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20",
    };

    return (
      <Badge
        variant="outline"
        className={
          colorMap[normalized] ||
          "bg-muted text-muted-foreground"
        }
      >
        {statusValue || "N/A"}
      </Badge>
    );
  };

  const isPendingManualPayment = (payment) => {
    return (
      String(payment?.status || "").toUpperCase() ===
        "PENDING" &&
      String(payment?.paymentMethod || "").toUpperCase() ===
        "USDT"
    );
  };
    const approvePayment = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this payment?"
    );

    if (!confirmed) return;

    try {
      const response = await axios.put(
        `${url}/payment/approve/${paymentId}`,
        {},
        setHeaders()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to approve payment."
        );
      }

      toast.success(
        response.data?.message ||
          "Payment approved successfully.",
        {
          position: "top-center",
        }
      );

      dispatch(getAllPayments());
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve payment.";

      toast.error(message, {
        position: "top-center",
      });
    }
  };

  const rejectPayment = async (paymentId) => {
    const rejectionReason = window.prompt(
      "Enter the rejection reason:",
      "Incorrect or invalid screenshot."
    );

    if (!rejectionReason?.trim()) {
      toast.warning(
        "A rejection reason is required.",
        {
          position: "top-center",
        }
      );

      return;
    }

    try {
      const response = await axios.put(
        `${url}/payment/reject/${paymentId}`,
        {
          rejectionReason:
            rejectionReason.trim(),
        },
        setHeaders()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to reject payment."
        );
      }

      toast.success(
        response.data?.message ||
          "Payment rejected successfully.",
        {
          position: "top-center",
        }
      );

      dispatch(getAllPayments());
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject payment.";

      toast.error(message, {
        position: "top-center",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (status === "pending") {
    return (
      <div className="space-y-6 px-1 py-2 sm:px-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Finance
          </p>

          <h1 className="text-2xl font-semibold text-foreground">
            Payment History
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Loading payment records...
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading payments...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 px-1 py-2 sm:px-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Finance
          </p>

          <h1 className="text-2xl font-semibold text-foreground">
            Payment History
          </h1>
        </div>

        <Card className="border-rose-500/20">
          <CardContent className="p-8 text-center">
            <p className="font-medium text-rose-500">
              Unable to load payments
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>

            <button
              onClick={() =>
                dispatch(getAllPayments())
              }
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 py-2 sm:px-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Finance
          </p>

          <h1 className="text-2xl font-semibold text-foreground">
            Payment History
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review manual USDT payments and manage
            subscription approvals.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          Total payments:{" "}
          <span className="font-semibold text-foreground">
            {payments.length}
          </span>
        </div>
      </div>

      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />

              <Input
                type="text"
                placeholder="Search user, reference, plan, network..."
                className="rounded-full pl-9"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="status-filter"
                className="text-sm text-muted-foreground"
              >
                Status:
              </label>

              <select
                id="status-filter"
                className="w-full rounded-full border border-border/70 bg-background px-3 py-2 text-sm outline-none sm:w-40"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">
                  All payments
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>

                <option value="success">
                  Success
                </option>
              </select>

              {(searchTerm ||
                statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
            {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

      <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm md:block">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="border-b border-border/70 bg-muted/40">
              <TableRow>
                {[
                  "User",
                  "Plan",
                  "Amount",
                  "Method",
                  "Status",
                  "Reference",
                  "Screenshot",
                  "Date",
                  "Actions",
                ].map((head) => (
                  <TableHead
                    key={head}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="transition hover:bg-muted/40"
                  >
                    {/* USER */}
                    <TableCell className="px-5 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.user?.name ||
                            "Unknown user"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {payment.user?.email ||
                            "No email"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {payment.phoneNumber ||
                            "No phone"}
                        </p>
                      </div>
                    </TableCell>

                    {/* PLAN */}
                    <TableCell className="px-5 py-4">
                      <span className="font-medium text-foreground">
                        {payment.planId || "N/A"}
                      </span>
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell className="px-5 py-4">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(
                          payment.amount
                        )}
                      </span>
                    </TableCell>

                    {/* METHOD */}
                    <TableCell className="px-5 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.paymentMethod ||
                            "N/A"}
                        </p>

                        {payment.network && (
                          <p className="text-xs text-muted-foreground">
                            {payment.network}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="px-5 py-4">
                      {getStatusBadge(
                        payment.status
                      )}
                    </TableCell>

                    {/* REFERENCE */}
                    <TableCell className="max-w-[180px] px-5 py-4">
                      <span className="break-all text-xs text-muted-foreground">
                        {payment.reference ||
                          "N/A"}
                      </span>
                    </TableCell>

                    {/* SCREENSHOT */}
                    <TableCell className="px-5 py-4">
                      {payment.screenshotUrl ? (
                        <a
                          href={
                            payment.screenshotUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                        >
                          <FaEye />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No screenshot
                        </span>
                      )}
                    </TableCell>

                    {/* DATE */}
                    <TableCell className="px-5 py-4 text-xs text-muted-foreground">
                      {formatDate(
                        payment.createdAt
                      )}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="px-5 py-4">
                      {isPendingManualPayment(
                        payment
                      ) ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approvePayment(
                                payment.id
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            <FaCheck />
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectPayment(
                                payment.id
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                          >
                            <FaTimes />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No actions
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No payments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* =====================================================
          MOBILE CARDS
      ===================================================== */}

      <div className="grid gap-3 md:hidden">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className="border border-border/70 bg-card/80 shadow-sm"
            >
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {payment.user?.name ||
                        "Unknown user"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {payment.user?.email ||
                        "No email"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {payment.phoneNumber ||
                        "No phone"}
                    </p>
                  </div>

                  {getStatusBadge(
                    payment.status
                  )}
                </div>

                <div className="grid gap-2 rounded-xl bg-muted/30 p-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Plan
                    </span>

                    <span className="font-medium text-foreground">
                      {payment.planId || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Amount
                    </span>

                    <span className="font-semibold text-foreground">
                      {formatCurrency(
                        payment.amount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Method
                    </span>

                    <span className="text-foreground">
                      {payment.paymentMethod ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Network
                    </span>

                    <span className="text-foreground">
                      {payment.network || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Date
                    </span>

                    <span className="text-right text-xs text-foreground">
                      {formatDate(
                        payment.createdAt
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Reference
                  </p>

                  <p className="break-all text-xs text-foreground">
                    {payment.reference || "N/A"}
                  </p>
                </div>

                {payment.screenshotUrl && (
                  <a
                    href={payment.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <FaEye />
                    View Payment Screenshot
                  </a>
                )}

                {isPendingManualPayment(
                  payment
                ) && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        approvePayment(
                          payment.id
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                      <FaCheck />
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        rejectPayment(
                          payment.id
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                    >
                      <FaTimes />
                      Reject
                    </button>
                  </div>
                )}

                {payment.status ===
                  "REJECTED" &&
                  payment.rejectionReason && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                      <p className="text-xs font-semibold text-rose-500">
                        Rejection reason
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {
                          payment.rejectionReason
                        }
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border border-dashed border-border/70 bg-background/60">
            <CardContent className="p-8 text-center">
              <p className="font-medium text-foreground">
                No payments found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or status
                filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{" "}
          <strong className="text-foreground">
            {filteredPayments.length}
          </strong>{" "}
          of{" "}
          <strong className="text-foreground">
            {payments.length}
          </strong>{" "}
          payments
        </span>

        {statusFilter !== "all" && (
          <span>
            Filter:{" "}
            <strong className="capitalize text-foreground">
              {statusFilter}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsHistory;
