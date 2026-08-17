/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { AlignJustify, LogOut, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name, id, email, phoneNumber } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/90 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          onClick={() => setOpen(true)}
          variant="ghost"
          size="icon"
          className="rounded-full border border-border/70 bg-card/70 hover:bg-accent lg:hidden"
        >
          <AlignJustify className="w-5 h-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Home Button */}
        <Button
          onClick={() => navigate("/admin/dashboard")}
          variant="ghost"
          size="icon"
          className="hidden rounded-full border border-border/70 bg-card/70 hover:bg-accent sm:flex"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full border border-border/70 bg-card/70 hover:bg-accent"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src="/avatars/admin.png" alt="Admin Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-white">
                  {name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64" align="end" forceMount>
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground break-all">{email}</p>
              {phoneNumber && (
                <p className="text-xs text-muted-foreground">{phoneNumber}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                ID: <span className="font-medium text-foreground">{id}</span>
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AdminHeader;
