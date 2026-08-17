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

const AdminAddJackpot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jackpotType: "",
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
    navigate("/admin/jackpots");
  };

  return (
    <div className="container max-w-2xl px-4 py-8 mx-auto">
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/jackpots")}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create New Tip
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="jackpotType"
                className="text-gray-700 dark:text-gray-300"
              >
                Jackpot Type
              </Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("jackpotType", value)
                }
                value={formData.jackpotType}
                required
              >
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select tip type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem
                    value="odibets"
                    className="hover:dark:bg-gray-600"
                  >
                    Odibets
                  </SelectItem>
                  <SelectItem
                    value="sportpesaMid"
                    className="hover:dark:bg-gray-600"
                  >
                    sportpesa Midweek JP
                  </SelectItem>
                  <SelectItem
                    value="sportpesaMega"
                    className="hover:dark:bg-gray-600"
                  >
                    sportpesa Mega JP
                  </SelectItem>
                  <SelectItem
                    value="mozzart"
                    className="hover:dark:bg-gray-600"
                  >
                    mozzart
                  </SelectItem>
                  <SelectItem
                    value="betikaMid"
                    className="hover:dark:bg-gray-600"
                  >
                    betika Midweek
                  </SelectItem>
                  <SelectItem
                    value="betikaMega"
                    className="hover:dark:bg-gray-600"
                  >
                    betika Mega
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="prediction"
                className="text-gray-700 dark:text-gray-300"
              >
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
              <Label
                htmlFor="match"
                className="text-gray-700 dark:text-gray-300"
              >
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
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/admin/jackpots")}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full bg-blue-600 md:w-auto hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Create Jp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddJackpot;
