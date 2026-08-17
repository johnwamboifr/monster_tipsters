/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";
import { toast } from "react-toastify";

const initialState = {
  list: [],
  status: null,
  error: null,
};

/* =========================================================
   GET CURRENT USER PAYMENTS
========================================================= */

export const getUserPayments = createAsyncThunk(
  "payments/getUserPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${url}/payment/my`,
        setHeaders()
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch payment history.";

      console.error("Error fetching user payments:", message);

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   GET ALL PAYMENTS - ADMIN
========================================================= */

export const getAllPayments = createAsyncThunk(
  "payments/getAllPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${url}/payment/all`,
        setHeaders()
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch all payments.";

      console.error(
        "Error fetching all payments:",
        message
      );

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   M-PESA PAYMENT
   DO NOT CHANGE THIS FLOW
========================================================= */

export const initiatePayment = createAsyncThunk(
  "payments/initiatePayment",
  async ({ phone, amount, id }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/payment/stkpush`,
        {
          phone,
          amount,
          id,
        },
        setHeaders()
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to initiate payment.";

      console.error("Error initiating payment:", message);

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   MANUAL USDT / TRC20 PAYMENT
========================================================= */

export const createManualPayment = createAsyncThunk(
  "payments/createManualPayment",
  async (
    { selectedPlan, amount, reference, screenshot },
    { rejectWithValue }
  ) => {
    try {
      if (!screenshot) {
        return rejectWithValue(
          "Payment screenshot is required."
        );
      }

      const formData = new FormData();

      formData.append("selectedPlan", selectedPlan);

      if (amount !== undefined && amount !== null) {
        formData.append("amount", amount);
      }

      if (reference) {
        formData.append("reference", reference);
      }

      formData.append("screenshot", screenshot);

      const response = await axios.post(
        `${url}/payment/manual`,
        formData,
        {
          ...setHeaders(),
          headers: {
            ...setHeaders().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        response.data?.message ||
          "Payment submitted successfully.",
        {
          position: "top-center",
        }
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to submit manual payment.";

      console.error(
        "Error creating manual payment:",
        message
      );

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   SLICE
========================================================= */

const paymentSlice = createSlice({
  name: "payments",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* =====================================================
         GET USER PAYMENTS
      ===================================================== */

      .addCase(getUserPayments.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(getUserPayments.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        state.list = Array.isArray(
          action.payload?.data
        )
          ? action.payload.data
          : [];
      })

      .addCase(getUserPayments.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          action.error?.message ||
          "Unable to fetch payment history.";
      })
      /* =====================================================
   GET ALL PAYMENTS - ADMIN
===================================================== */

.addCase(getAllPayments.pending, (state) => {
  state.status = "pending";
  state.error = null;
})

.addCase(getAllPayments.fulfilled, (state, action) => {
  state.status = "success";
  state.error = null;

  state.list = Array.isArray(action.payload?.data)
    ? action.payload.data
    : [];
})

.addCase(getAllPayments.rejected, (state, action) => {
  state.status = "rejected";

  state.error =
    action.payload ||
    action.error?.message ||
    "Unable to fetch all payments.";
})

      /* =====================================================
         M-PESA PAYMENT
      ===================================================== */

      .addCase(initiatePayment.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
      })

      .addCase(initiatePayment.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          action.error?.message ||
          "Unable to initiate payment.";
      })

      /* =====================================================
         MANUAL PAYMENT
      ===================================================== */

      .addCase(createManualPayment.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(createManualPayment.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        /*
         * Add the newly submitted payment immediately
         * to the user's payment history.
         */

        const payment = action.payload?.data;

        if (payment) {
          state.list = [
            payment,
            ...state.list,
          ];
        }
      })

      .addCase(createManualPayment.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          action.error?.message ||
          "Unable to submit manual payment.";
      });
  },
});

export default paymentSlice.reducer;
