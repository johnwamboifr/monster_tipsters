/* eslint-disable no-unused-vars */
/** @format */

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { uploadImage } from "@/features/slices/imagesSlice";
import { toast } from "react-toastify";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();
  const images = useSelector((state) => state.images.list);
  const status = useSelector((state) => state.images.status);
  const error = useSelector((state) => state.images.error);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      setImage(file);
  
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file less than 5MB.", {
        position: "top-right",
      });
    }
  };
  
const handleSubmit = (e) => {
  e.preventDefault();

  if (image) {
    const formData = new FormData();
    formData.append("my_file", image);  // <-- changed here

    dispatch(uploadImage(formData))
      .unwrap()
      .catch((err) => {
        toast.error(err.message, { position: "top-right" });
      });
    setImage(null);
    setPreview(null);
  }
};

  
  

  return (
    <div className="container mx-auto p-4 mt-12">
      <h1 className="text-2xl font-extrabold mb-6 text-center text-gray-800">
        Upload Images
      </h1>

      {/* Image Upload Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block mb-4"
        />
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
        <Button
          type="submit"
          disabled={status === "pending"}
          className={`bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg ${
            status === "pending" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {status === "pending" ? "Uploading..." : "Upload"}
        </Button>
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center mb-4">
          {error || "Something went wrong. Please try again."}
        </p>
      )}

      {/* Display Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <Card key={index}>
              <CardContent>
                <CardTitle>Image {index + 1}</CardTitle>
                <img
                  src={img.url}
                  alt={img.alt || `Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-md"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
