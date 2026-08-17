import { Outlet, useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  Sparkles,
  Home,
  Trophy,
  Award,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Users,
  Settings,
  ClipboardList,
  Wallet,
  Landmark,
  BadgePercent,
  CircleDollarSign,
  Send,
  Activity,
  User,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/features/slices/authSlice";

const publicItems = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "free-tips", label: "Free Tips", path: "/free-tips", icon: ShieldCheck },
  { id: "premium-tips", label: "Premium Tips", path: "/premium-tips", icon: BadgePercent },
  { id: "fixtures", label: "Fixtures", path: "/fixtures", icon: CalendarDays },
  { id: "results", label: "Results", path: "/results", icon: Trophy },
  { id: "standings", label: "Standings", path: "/standings", icon: BarChart3 },
  //{ id: "scorers", label: "Scorers", path: "/scorers", icon: Award },
  { id: "leagues", label: "Leagues", path: "/leagues", icon: Landmark },
  { id: "statistics", label: "Statistics", path: "/statistics", icon: Activity },
  { id: "jackpots", label: "Jackpots", path: "/jackpots", icon: CircleDollarSign },
  { id: "contact", label: "Contact", path: "/contact", icon: Send },
];

const adminItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
 // { id: "tips-management", label: "Tips Management", path: "/predictions", icon: ClipboardList },
  { id: "vip-management", label: "Premium Management", path: "/vip", icon: ShieldCheck },
  { id: "users", label: "Users", path: "/users", icon: Users },
  { id: "predictions", label: "Predictions", path: "/predictions", icon: ClipboardList },
  { id: "payments", label: "Payments", path: "/payments", icon: Wallet },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

const SidebarLink = ({ item, onNavigate }) => {
  const { userType, name, email } = useSelector((state) => state.auth);
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-emerald-500/10 text-emerald-200"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userType, name, email } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const showAdmin = userType === "admin";
  const displayName = name?.trim() || email?.split("@")[0] || "User";
  const displayEmail = email || "No email available";
  const avatarInitial = (name?.trim() || email || "U").charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileOpen(false);
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_25%),linear-gradient(135deg,#020617_0%,#07111f_100%)] text-slate-100">
      {mobileOpen ? <div className="fixed inset-0 z-20 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <div className="flex min-h-screen">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/10 bg-slate-950/85 backdrop-blur-xl transition-transform duration-200",
          "w-72",
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"
        )}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Monster Tipsters</p>
              </div>
            </Link>
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-300 hover:bg-white/5 hover:text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-4">
              <div className="space-y-1">
                {publicItems.map((item) => (
                  <SidebarLink key={item.id} item={item} onNavigate={() => setMobileOpen(false)} />
                ))}
              </div>

              {showAdmin ? (
                <>
                  <Separator className="bg-white/10" />
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Admin</div>
                    {adminItems.map((item) => (
                      <SidebarLink key={item.id} item={item} onNavigate={() => setMobileOpen(false)} />
                    ))}
                  </div>
                </>
              ) : null}
            </nav>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:ml-72">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{showAdmin ? "Admin workspace" : "Football platform"}</p>
                  <h2 className="text-sm font-semibold text-white">{location.pathname === "/" ? "Home" : location.pathname.split("/").filter(Boolean).join(" / ")}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 text-white hover:bg-white/10">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-500/15 text-sm font-semibold text-emerald-200">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64 border border-white/10 bg-slate-950/95 text-slate-100" side="bottom">
                    <DropdownMenuLabel className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-emerald-500/15 text-sm font-semibold text-emerald-200">
                            {avatarInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                          <p className="truncate text-xs text-slate-400">{displayEmail}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/profile");
                      }}
                      className="cursor-pointer px-3 py-2 text-sm text-slate-200 focus:bg-white/10 focus:text-white"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer px-3 py-2 text-sm text-red-300 focus:bg-red-500/10 focus:text-red-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
