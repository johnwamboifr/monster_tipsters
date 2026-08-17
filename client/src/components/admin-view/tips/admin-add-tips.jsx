/** @format */

import { createTip } from "@/features/slices/tipsSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AdminAddTips = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    league: "",
    date: "",
    time: "",
    odds: "",
    tipsType: "",
    prediction: "",
    match: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTip(formData));
    navigate("/admin/tips");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/tips")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create New Tip
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="league" className="text-gray-700 dark:text-gray-300">
                League
              </Label>
              <Input
                type="text"
                id="league"
                name="league"
                value={formData.league}
                onChange={handleChange}
                placeholder="Premier League"
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odds" className="text-gray-700 dark:text-gray-300">
                Odds
              </Label>
              <Input
                type="text"
                id="odds"
                name="odds"
                value={formData.odds}
                onChange={handleChange}
                placeholder="1.85"
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipsType" className="text-gray-700 dark:text-gray-300">
                Tips Type
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange("tipsType", value)}
                value={formData.tipsType}
                required
              >
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select tip type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="free" className="hover:dark:bg-gray-600">Free</SelectItem>
                  <SelectItem value="bronze" className="hover:dark:bg-gray-600">Bronze</SelectItem>
                  <SelectItem value="silver" className="hover:dark:bg-gray-600">Silver</SelectItem>
                  <SelectItem value="gold" className="hover:dark:bg-gray-600">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prediction" className="text-gray-700 dark:text-gray-300">
                Prediction
              </Label>
              <Input
                type="text"
                id="prediction"
                name="prediction"
                value={formData.prediction}
                onChange={handleChange}
                placeholder="Home Win"
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="match" className="text-gray-700 dark:text-gray-300">
                Match
              </Label>
              <Input
                type="text"
                id="match"
                name="match"
                value={formData.match}
                onChange={handleChange}
                placeholder="Team A vs Team B"
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-700 dark:text-gray-300">
                Time
              </Label>
              <Input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/admin/tips")}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Create Tip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddTips;