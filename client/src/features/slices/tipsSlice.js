/* eslint-disable no-undef */
/** @format */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  singleTip: null,
  status: null,
  error: null,
};

/* =========================================================
   FETCH ALL TIPS
========================================================= */

export const fetchTips = createAsyncThunk(
  "tips/fetchTips",
  async (_, { rejectWithValue }) => {
    try {
      const headers = await setHeaders();

      console.log("auth headers from fetchTips:", headers)

      const response = await axios.get(
        `${url}/tips/get`,
        headers
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch tips.";

      console.error("Error fetching tips:", message);

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   FETCH SINGLE TIP
========================================================= */

export const fetchSingleTip = createAsyncThunk(
  "tips/fetchSingleTip",
  async (tipId, { rejectWithValue }) => {
    try {
      const headers = await setHeaders();

      const response = await axios.get(
        `${url}/tips/get/${tipId}`,
        headers
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch tip.";

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   CREATE TIP
========================================================= */

export const createTip = createAsyncThunk(
  "tips/createTip",
  async (values, { rejectWithValue }) => {
    try {
      const headers = await setHeaders();

      const response = await axios.post(
        `${url}/tips/create`,
        values,
        headers
      );

      toast.success(
        response.data?.message || "Tip created successfully.",
        {
          position: "top-center",
        }
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create tip.";

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   DELETE TIP
========================================================= */

export const deleteTip = createAsyncThunk(
  "tips/deleteTip",
  async (tipId, { rejectWithValue }) => {
    try {
      const headers = await setHeaders();

      await axios.delete(
        `${url}/tips/delete/${tipId}`,
        headers
      );

      toast.success("Tip deleted successfully.", {
        position: "top-center",
      });

      return tipId;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to delete tip.";

      toast.error(message, {
        position: "top-center",
      });

      return rejectWithValue(message);
    }
  }
);

/* =========================================================
   UPDATE TIP
========================================================= */

export const updateTip = createAsyncThunk(
  "tips/updateTip",
  async ({ tipId, formData }, { rejectWithValue }) => {
    try {
      const headers = await setHeaders();

      const response = await axios.put(
        `${url}/tips/update/${tipId}`,
        formData,
        headers
      );

      toast.success(
        response.data?.message || "Tip updated successfully.",
        {
          position: "top-center",
        }
      );

      return {
        tipId,
        data: response.data,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update tip.";

      console.error("Error updating tip:", message);

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

const tipsSlice = createSlice({
  name: "tips",

  initialState,

  reducers: {
    setList: (state, action) => {
      state.list = Array.isArray(action.payload)
        ? action.payload
        : [];

      state.status = "success";
      state.error = null;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.status = "rejected";
    },

    clearSingleTip: (state) => {
      state.singleTip = null;
    },

    clearTips: (state) => {
      state.list = [];
      state.singleTip = null;
      state.status = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         FETCH SINGLE TIP
      ===================================================== */

      .addCase(fetchSingleTip.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(fetchSingleTip.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        state.singleTip =
          action.payload?.data || null;
      })

      .addCase(fetchSingleTip.rejected, (state, action) => {
        state.status = "rejected";
        state.error =
          action.payload ||
          "Unable to fetch tip.";

        state.singleTip = null;
      })

      /* =====================================================
         FETCH TIPS
      ===================================================== */

      .addCase(fetchTips.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(fetchTips.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        state.list = Array.isArray(
          action.payload?.data
        )
          ? action.payload.data
          : [];
      })

      .addCase(fetchTips.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          "Unable to fetch tips.";
      })

      /* =====================================================
         CREATE TIP
      ===================================================== */

      .addCase(createTip.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(createTip.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        /*
         * The current backend returns:
         *
         * {
         *   success: true,
         *   message: "Tip created successfully."
         * }
         *
         * Therefore we should NOT push action.payload
         * into the list because that is not the Tip record.
         *
         * The admin page can refetch the list after creation.
         */
      })

      .addCase(createTip.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          "Unable to create tip.";
      })

      /* =====================================================
         DELETE TIP
      ===================================================== */

      .addCase(deleteTip.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(deleteTip.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        state.list = state.list.filter(
          (tip) => tip.id !== action.payload
        );

        if (
          state.singleTip?.id === action.payload
        ) {
          state.singleTip = null;
        }
      })

      .addCase(deleteTip.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          "Unable to delete tip.";
      })

      /* =====================================================
         UPDATE TIP
      ===================================================== */

      .addCase(updateTip.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(updateTip.fulfilled, (state) => {
        state.status = "success";
        state.error = null;

        /*
         * Current backend returns only:
         *
         * {
         *   success: true,
         *   message: "Tip Updated successfully"
         * }
         *
         * Therefore the admin page should refetch
         * the tips after updating.
         */
      })

      .addCase(updateTip.rejected, (state, action) => {
        state.status = "rejected";

        state.error =
          action.payload ||
          "Unable to update tip.";
      });
  },
});

export const {
  setList,
  setError,
  clearSingleTip,
  clearTips,
} = tipsSlice.actions;

export default tipsSlice.reducer;
