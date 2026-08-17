/** @format */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null,
};

export const fetchJackpots = createAsyncThunk(
  "jackpots/fetchJackpots",
  async () => {
    try {
      const response = await axios.get(`${url}/jackpots/get`, setHeaders());
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

export const createJackpot = createAsyncThunk(
  "jackpots/createJackpot",
  async (values) => {
    try {
      const response = await axios.post(
        `${url}/jackpots/create`,
        values,
        setHeaders()
      );
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

export const deleteJackpot = createAsyncThunk(
  "jackpots/deleteJackpot",
  async (jackpotId) => {
    try {
      await axios.delete(`${url}/jackpots/delete/${jackpotId}`, setHeaders());
      return jackpotId;
    } catch (error) {
      console.error("Error deleting jackpot:", error);
      toast.error(error.response.data.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

export const updateJackpot = createAsyncThunk(
  "jackpots/updateJackpot",
  async (jackpotId, formData) => {
    try {
      const response = await axios.put(
        `${url}/jackpots/update/${jackpotId}`,
        formData,
        setHeaders()
      );
      toast.success(response.data.message, {
        position: "top-center",
      });
      console.log("response.data", response.data);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

const jackpotSlice = createSlice({
  name: "jackpots",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJackpots.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchJackpots.fulfilled, (state, action) => {
        console.log("action.payload", action.payload.data);
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchJackpots.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(createJackpot.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.status = "success";
      })
      .addCase(createJackpot.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createJackpot.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(deleteJackpot.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (jackpot) => jackpot.id !== action.payload
        );
        state.status = "success";
      })
      .addCase(deleteJackpot.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteJackpot.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(updateJackpot.fulfilled, (state, action) => {
        const updatedJackpot = action.payload;
        const index = state.list.findIndex(
          (jackpot) => jackpot.id === updatedJackpot.id
        );
        if (index !== -1) {
          state.list[index] = updatedJackpot;
        }
     
        state.status = "success";
      })
      .addCase(updateJackpot.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateJackpot.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export default jackpotSlice.reducer;
