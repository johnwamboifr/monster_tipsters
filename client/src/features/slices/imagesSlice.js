/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";

// Initial State
const initialState = {
  list: [],
  status: null,
  error: null,
};

// Upload Image Thunk
export const uploadImage = createAsyncThunk(
  "images/uploadImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/images/upload`, formData, setHeaders());

      console.log("response uploading image", response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Fetch Images Thunk
export const fetchImages = createAsyncThunk(
  "images/fetchImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/images/get`, setHeaders());
      console.log("response geting images", response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch images");
    }
  }
);

// Delete Image Thunk
export const deleteImage = createAsyncThunk(
  "images/deleteImage",
  async (imageId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${url}/images/delete/${imageId}`, setHeaders());
      console.log("response deleing image", response.data)
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete image");
    }
  }
);

// Update Image Thunk
export const updateImage = createAsyncThunk(
  "images/updateImage",
  async ({ imageId, imageUrl }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/images/update/${imageId}`,
        { imageUrl },
        setHeaders()
      );
      console.log("response updaing image", response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update image");
    }
  }
);

// Slice
const imagesSlice = createSlice({
  name: "images",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Upload Image
    builder
      .addCase(uploadImage.pending, (state) => {
        state.status = "pending";
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        console.log("action dot payload on image upload", action.payload.data)
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.status = "rejected";
        console.log("rejection image upload", action.payload.message)
        state.error = action.payload.message;
      });

    // Fetch Images
    builder
      .addCase(fetchImages.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        console.log("fetch images", action.payload.data)
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });

    // Delete Image
    builder
      .addCase(deleteImage.pending, (state) => {
        state.status = "pending";
        
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.list = state.list.filter((image) => image.id !== action.payload);
        state.status = "success";
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });

    // Update Image
    builder
      .addCase(updateImage.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateImage.fulfilled, (state, action) => {
        const updatedImage = action.payload;
        const index = state.list.findIndex((image) => image.id === updatedImage.id);
        if (index !== -1) {
          state.list[index] = updatedImage;
        }
        state.status = "success";
      })
      .addCase(updateImage.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export default imagesSlice.reducer;
