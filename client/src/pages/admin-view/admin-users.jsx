import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MoreHorizontal } from "lucide-react";
import {
  deleteUser,
  fetchUsers,
  updateUser,
} from "@/features/slices/usersSlice";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaEdit, FaTrashAlt, FaUserShield, FaUserTie, FaUser, FaSearch } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    userType: "",
    password: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        phoneNumber: selectedUser.phoneNumber,
        userType: selectedUser.userType,
        password: "",
      });
    }
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (users || []).filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term);
      const matchesRole = roleFilter === "all" || user.userType === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, roleFilter, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.userType) {
      toast.error("Please fill all required fields", { position: "top-center" });
      return;
    }

    try {
      if (selectedUser) {
        const dataToUpdate = { ...formData };
        if (!formData.password) delete dataToUpdate.password;
        await dispatch(updateUser({ userId: selectedUser.id, formData: dataToUpdate })).unwrap();
        setSelectedUser(null);
        dispatch(fetchUsers());
        toast.success("User updated successfully!");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await dispatch(deleteUser(confirmDelete.id)).unwrap();
        setConfirmDelete(null);
        dispatch(fetchUsers());
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error(error?.message || "Failed to delete user");
      }
    }
  };

  const getUserBadge = (userType) => {
    const variantMap = {
      admin: "destructive",
      client: "default",
      vip: "secondary",
    };
    const iconMap = {
      admin: <FaUserShield className="mr-1 text-purple-600" />,
      vip: <FaUserTie className="mr-1 text-yellow-600" />,
      client: <FaUser className="mr-1 text-blue-600" />,
    };
    return (
      <Badge variant={variantMap[userType] || "default"} className="flex items-center capitalize">
        {iconMap[userType] || <FaUser className="mr-1" />}
        {userType}
      </Badge>
    );
  };

  const summary = {
    total: users?.length || 0,
    admins: (users || []).filter((user) => user.userType === "admin").length,
    vip: (users || []).filter((user) => user.userType === "vip").length,
  };

  const renderUserActions = (user) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link to={`/admin/view/user/${user.id}`} className="flex items-center gap-2">
            <AiOutlineEye className="h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>

        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <span className="flex items-center gap-2">
                <FaEdit className="h-4 w-4" />
                Edit
              </span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information below.</DialogDescription>
            </DialogHeader>
            <form className="mt-4 space-y-4" onSubmit={handleSave}>
              <div>
                <Label>Full Name</Label>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(val) => setFormData({ ...formData, userType: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>New Password (Optional)</Label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <span className="flex items-center gap-2 text-red-600">
                <FaTrashAlt className="h-4 w-4" />
                Delete
              </span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6 px-1 py-2 sm:px-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Administration</p>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor account access, roles, and customer activity.</p>
        </div>
        <Button onClick={() => dispatch(fetchUsers())} variant="outline" className="rounded-full">
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.admins}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">VIP users</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.vip}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone"
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full rounded-full md:w-48">
            <SelectValue placeholder="Filter role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === "pending" ? (
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
      ) : status === "rejected" ? (
        <div className="rounded-2xl border border-red-200 bg-red-500/10 p-4 text-center text-red-600">
          {error}
        </div>
      ) : status === "success" && filteredUsers.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Last IP</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="transition hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 font-medium text-foreground">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[16rem] break-all text-sm text-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>{user.phoneNumber || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{user.lastLoginAt ? moment(user.lastLoginAt).format("MMM D, YYYY, h:mm A") : <span className="text-muted-foreground">Never</span>}</TableCell>
                      <TableCell>{user.lastLoginIp || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{getUserBadge(user.userType)}</TableCell>
                      <TableCell className="text-right">
                        {renderUserActions(user)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 font-medium text-foreground">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {renderUserActions(user)}
                </div>

                <div className="mt-4 space-y-2 text-sm text-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="break-all">{user.phoneNumber || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Role:</span>
                    {getUserBadge(user.userType)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Subscription:</span>
                    <span>{user.userType === "vip" ? "VIP access" : user.accessExpiration ? "Active" : "Standard"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{user.createdAt ? moment(user.createdAt).format("MMM D, YYYY") : "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        status === "success" && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <FaUser className="text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or refresh the list.</p>
          </div>
        )
      )}
    </div>
  );
};

export default AdminUsers;
