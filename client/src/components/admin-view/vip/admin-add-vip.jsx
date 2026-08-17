import { createCode } from "@/features/slices/codeSlice";
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

const AdminAddVip = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    results: "",
    codeType: "",
    code: "",
  });

  // handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // handle select input
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.code || !formData.results || !formData.codeType) {
      alert("All fields are required!");
      return;
    }

    dispatch(createCode(formData));
    navigate("/admin/vip");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-4 text-blue-600"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Add VIP Tip</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CodeType */}
        <div>
          <Label htmlFor="codeType">Betting Site</Label>
          <Select
            onValueChange={(value) => handleSelectChange("codeType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Betting Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1xbet">1XBET</SelectItem>
              <SelectItem value="secretbet">Secret Bet</SelectItem>
              <SelectItem value="afropari">Afropari</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div>
          <Label htmlFor="results">Result</Label>
          <Select
            onValueChange={(value) => handleSelectChange("results", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Code */}
        <div>
          <Label htmlFor="code">VIP Code</Label>
          <Input
            id="code"
            type="text"
            name="code"
            placeholder="Enter VIP code"
            value={formData.code}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full">
          Save VIP Tip
        </Button>
      </form>
    </div>
  );
};

export default AdminAddVip;
