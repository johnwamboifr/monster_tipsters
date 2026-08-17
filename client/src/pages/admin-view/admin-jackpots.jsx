/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { FaTrashAlt, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import Loader from "@/components/common/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchJackpots,
  createJackpot,
  deleteJackpot,
  updateJackpot,
} from "@/features/slices/jackpotSlice";

const JACKPOT_TYPES = [
  { value: "odibets", label: "Odibets" },
  { value: "sportpesaMid", label: "Sportpesa Midweek JP" },
  { value: "sportpesaMega", label: "Sportpesa Mega JP" },
  { value: "mozzart", label: "Mozzart" },
  { value: "betikaMid", label: "Betika Midweek" },
  { value: "betikaMega", label: "Betika Mega" },
];

const RESULT_OPTIONS = [
  { value: "win", label: "Win" },
  { value: "loss", label: "Loss" },
  { value: "pending", label: "Pending" },
];

const getResultColor = (result) => {
  switch (result) {
    case "win":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "loss":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const JackpotForm = ({ formData, onInputChange, onSelectChange, onSave, isSaving }) => {
  const isFormValid = formData.match.trim() && formData.prediction.trim() && formData.jackpotType;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="match">Match</Label>
        <Input
          id="match"
          placeholder="e.g. Arsenal vs Chelsea"
          name="match"
          value={formData.match}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prediction">Prediction</Label>
        <Input
          id="prediction"
          placeholder="e.g. 1X or Over 2.5"
          name="prediction"
          value={formData.prediction}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="jackpotType">Jackpot Type</Label>
          <Select
            name="jackpotType"
            value={formData.jackpotType}
            onValueChange={(value) => onSelectChange({ target: { name: "jackpotType", value } })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {JACKPOT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="results">Result</Label>
          <Select
            name="results"
            value={formData.results}
            onValueChange={(value) => onSelectChange({ target: { name: "results", value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              {RESULT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" onClick={onSave} disabled={isSaving || !isFormValid} className="w-full md:w-auto">
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 mr-2" />
              {formData.id ? "Updating..." : "Saving..."}
            </>
          ) : (
            formData.id ? "Update Jackpot" : "Save Jackpot"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

const AdminJackpots = () => {
  const dispatch = useDispatch();
  const { list: jackpots, status, error } = useSelector((state) => state.jackpots);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedJackpot, setSelectedJackpot] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    match: "",
    prediction: "",
    jackpotType: "",
    results: "pending",
  });

  useEffect(() => {
    dispatch(fetchJackpots());
  }, [dispatch]);

  useEffect(() => {
    if (selectedJackpot) {
      setFormData({
        id: selectedJackpot.id,
        match: selectedJackpot.match,
        prediction: selectedJackpot.prediction,
        jackpotType: selectedJackpot.jackpotType,
        results: selectedJackpot.results || "pending",
      });
    } else {
      setFormData({
        match: "",
        prediction: "",
        jackpotType: "",
        results: "pending",
      });
    }
  }, [selectedJackpot]);

  const filteredJackpots = jackpots.filter((jackpot) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      jackpot.match.toLowerCase().includes(searchLower) ||
      jackpot.prediction.toLowerCase().includes(searchLower) ||
      jackpot.jackpotType.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { match, prediction, jackpotType } = formData;

      if (!match.trim() || !prediction.trim() || !jackpotType) {
        throw new Error("Match, Prediction and Type are required");
      }

      setIsSaving(true);

      const payload = {
        match: match.trim(),
        prediction: prediction.trim(),
        jackpotType,
        results: formData.results || "pending",
      };

      let result;
      if (formData.id) {
        result = await dispatch(updateJackpot({ jackpotId: formData.id, formData: payload }));
      } else {
        result = await dispatch(createJackpot(payload));
      }

      if (result.error) throw new Error(result.error.message || "Failed to save jackpot");

      toast.success(`Jackpot ${formData.id ? "updated" : "created"} successfully`);
      setIsAddDialogOpen(false);
      setSelectedJackpot(null);
      dispatch(fetchJackpots());
    } catch (err) {
      toast.error(err.message || "Error saving jackpot");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const result = await dispatch(deleteJackpot(confirmDelete.id));
      if (result.error) throw new Error(result.error.message || "Failed to delete jackpot");
      toast.success("Jackpot deleted successfully");
      dispatch(fetchJackpots());
    } catch (err) {
      toast.error(err.message || "Failed to delete jackpot");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">
            Jackpot Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all jackpot predictions and results
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search jackpots..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="gap-2 whitespace-nowrap"
            onClick={() => {
              setSelectedJackpot(null);
              setIsAddDialogOpen(true);
            }}
          >
            <FaPlus className="w-4 h-4" />
            Add Jackpot
          </Button>
        </div>
      </div>

      {status === "pending" && !jackpots.length ? (
        <div className="space-y-4 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Jackpots</CardTitle>
            <CardDescription>Click edit to update or delete a jackpot</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJackpots.map((jackpot) => (
                  <TableRow key={jackpot.id}>
                    <TableCell>{jackpot.match}</TableCell>
                    <TableCell>{jackpot.prediction}</TableCell>
                    <TableCell>{jackpot.jackpotType}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(jackpot.results)}`}>
                        {jackpot.results}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedJackpot(jackpot);
                        setIsAddDialogOpen(true);
                      }}>
                        <FaEdit />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(jackpot)}>
                        <FaTrashAlt />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Jackpot" : "Add Jackpot"}</DialogTitle>
            <DialogDescription>
              {formData.id ? "Update existing jackpot details" : "Fill in details to add a new jackpot"}
            </DialogDescription>
          </DialogHeader>
          <JackpotForm
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this jackpot? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJackpots;
