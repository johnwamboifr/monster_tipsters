/* eslint-disable react/prop-types */
import { LogOut, Menu, UserCog, Settings, Trophy, Sparkles, MoonStar, SunMedium } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/features/slices/authSlice";

const menuItems = [
  { id: "home", label: "Home", path: "/user/dashboard" },
  { id: "free-tips", label: "Free Tips", path: "/user/free-tips" },
  { id: "premium", label: "Premium Tips", path: "/user/premium-tips" },
  { id: "search", label: "Search", path: "/user/search" },
  { id: "profile", label: "Profile", path: "/user/profile" },
];

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </Button>
  );
}

function MenuItems({ close, mobile = false }) {
  return (
    <nav className={`flex ${mobile ? "flex-col" : "hidden lg:flex lg:flex-row lg:items-center"} gap-2 text-sm`}>
      {menuItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          onClick={close}
          className={({ isActive }) =>
            `rounded-full px-3 py-1.5 transition-all ${
              isActive
                ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/40"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderRight() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { name, userType } = useSelector((state) => state.auth);

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 p-0 hover:bg-white/10">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950">
                {name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 border border-white/10 bg-slate-950/95 text-slate-100" align="end" forceMount>
          <DropdownMenuLabel className="pb-1 font-normal">
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium text-white">{name}</p>
              <p className="text-[11px] text-slate-400">
                {userType === "admin"
                  ? "Administrator"
                  : userType === "vip"
                    ? "VIP User"
                    : "Customer"}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={() => navigate("/user/profile")} className="cursor-pointer py-2 text-sm text-slate-200">
            <UserCog className="mr-2 h-4 w-4 text-emerald-400" /> Profile
          </DropdownMenuItem>

          {userType === "admin" && (
            <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer py-2 text-sm text-slate-200">
              <Settings className="mr-2 h-4 w-4 text-blue-400" /> Admin
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={() => dispatch(logoutUser())} className="cursor-pointer py-2 text-sm text-red-300 hover:text-red-200">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function UserHeader() {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[260px] border-r border-white/10 bg-slate-950 p-4 text-slate-50">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <Link to="/user/dashboard" onClick={() => setOpenMenu(false)} className="mb-6 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-white">Monster Tipsters</span>
                  </Link>
                  <MenuItems close={() => setOpenMenu(false)} mobile />
                </div>
                <div className="mt-6 border-t border-white/10 pt-3">
                  <HeaderRight />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/user/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold tracking-[0.08em] text-white uppercase">Monster</span>
            </div>
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <MenuItems close={() => setOpenMenu(false)} />
        </div>

        <HeaderRight />
      </div>
    </header>
  );
}

export default UserHeader;
