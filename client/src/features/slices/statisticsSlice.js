/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

import { url, setHeaders } from "./api";

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  data: {
    overall: {
      total: 0,
      won: 0,
      lost: 0,
      refunded: 0,
      pending: 0,
      winRate: 0,
    },

    packages: {
      free: {
        total: 0,
        won: 0,
        lost: 0,
        refunded: 0,
        pending: 0,
        winRate: 0,
      },

      bronze: {
        total: 0,
        won: 0,
        lost: 0,
        refunded: 0,
        pending: 0,
        winRate: 0,
      },

      silver: {
        total: 0,
        won: 0,
        lost: 0,
        refunded: 0,
        pending: 0,
        winRate: 0,
      },

      gold: {
        total: 0,
        won: 0,
        lost: 0,
        refunded: 0,
        pending: 0,
        winRate: 0,
      },
    },
  },

  status: "idle",
  error: null,
};

/* =========================================================
   GET STATISTICS
========================================================= */

export const getStatistics = createAsyncThunk(
  "statistics/getStatistics",

  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${url}/statistics`,
        setHeaders()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to load statistics."
        );
      }
       console.log("data from statistics", response.data)

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message;

      console.error(
        "Error fetching statistics:",
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

const statisticsSlice = createSlice({
  name: "statistics",

  initialState,

  reducers: {
    clearStatisticsError: (state) => {
      state.error = null;
    },

    resetStatistics: (state) => {
      state.data = initialState.data;
      state.status = "idle";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         GET STATISTICS - PENDING
      ===================================================== */

      .addCase(
        getStatistics.pending,
        (state) => {
          state.status = "pending";
          state.error = null;
        }
      )

      /* =====================================================
         GET STATISTICS - SUCCESS
      ===================================================== */

      .addCase(
        getStatistics.fulfilled,
        (state, action) => {
          state.status = "success";
          state.error = null;

          if (action.payload?.data) {
            state.data = {
              ...state.data,
              ...action.payload.data,

              overall: {
                ...state.data.overall,
                ...(action.payload.data.overall || {}),
              },

              packages: {
                ...state.data.packages,
                ...(action.payload.data.packages || {}),

                free: {
                  ...state.data.packages.free,
                  ...(action.payload.data.packages?.free || {}),
                },

                bronze: {
                  ...state.data.packages.bronze,
                  ...(action.payload.data.packages?.bronze || {}),
                },

                silver: {
                  ...state.data.packages.silver,
                  ...(action.payload.data.packages?.silver || {}),
                },

                gold: {
                  ...state.data.packages.gold,
                  ...(action.payload.data.packages?.gold || {}),
                },
              },
            };
          }
        }
      )

      /* =====================================================
         GET STATISTICS - FAILED
      ===================================================== */

      .addCase(
        getStatistics.rejected,
        (state, action) => {
          state.status = "rejected";

          state.error =
            action.payload ||
            action.error?.message ||
            "Unable to load statistics.";
        }
      );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearStatisticsError,
  resetStatistics,
} = statisticsSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectStatistics = (state) =>
  state.statistics?.data;

export const selectOverallStatistics = (state) =>
  state.statistics?.data?.overall;

export const selectPackageStatistics = (state) =>
  state.statistics?.data?.packages;

export const selectFreeStatistics = (state) =>
  state.statistics?.data?.packages?.free;

export const selectBronzeStatistics = (state) =>
  state.statistics?.data?.packages?.bronze;

export const selectSilverStatistics = (state) =>
  state.statistics?.data?.packages?.silver;

export const selectGoldStatistics = (state) =>
  state.statistics?.data?.packages?.gold;

export const selectStatisticsStatus = (state) =>
  state.statistics?.status;

export const selectStatisticsError = (state) =>
  state.statistics?.error;

/* =========================================================
   EXPORT
========================================================= */

export default statisticsSlice.reducer;
