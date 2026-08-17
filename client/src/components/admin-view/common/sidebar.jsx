/* eslint-disable react/prop-types */
import {
  BadgeCheck,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  Home,
  Image,
  ChevronRight,
  LogOut,
  Wallet,
  Footprints,
  Sparkles,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/slices/authSlice";
import { useDispatch } from "react-redux";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "tips",
    label: "Tips Management",
    path: "/admin/tips",
    icon: <Footprints className="w-5 h-5" />,
  },
  {
    id: "premium-tips",
    label: "Premium Tips",
    path: "/admin/premium-tips",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "fixtures",
    label: "Fixture Predictions",
    path: "/admin/fixtures",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    id: "payments",
    label: "Payments History",
    path: "/admin/payments",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    id: "users",
    label: "User Management",
    path: "/admin/users",
    icon: <BadgeCheck className="w-5 h-5" />,
  },
  {
    id: "vips",
    label: "VIP Management",
    path: "/admin/vip",
    icon: <Image className="w-5 h-5" />,
  },
  {
    id: "media",
    label: "Media Library",
    path: "/admin/upload",
    icon: <Image className="w-5 h-5" />,
  },
];

const bottomMenuItems = [
  {
    id: "home",
    label: "View Site",
    path: "/user/dashboard",
    icon: <Home className="w-5 h-5" />,
    external: true,
  },
];

function MenuItems({ menuItems, setOpen, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((menuItem) => {
        const isActive = location.pathname.startsWith(menuItem.path);
        return (
          <button
            key={menuItem.id}
            onClick={() => {
              if (menuItem.external) window.open(menuItem.path, "_blank");
              else navigate(menuItem.path);
              if (isMobile && setOpen) setOpen(false);
            }}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all",
              isActive
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-300"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-accent/70 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {menuItem.icon}
              </span>
              <span>{menuItem.label}</span>
            </div>
            {menuItem.external && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  return (
    <Fragment>
      {/* ✅ Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] border-r border-border/70 bg-background/95 p-0">
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border/70 p-5">
              <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-primary">
                  <ChartNoAxesCombined className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold">Admin Panel</p>
                  <p className="text-xs font-normal text-muted-foreground">Management suite</p>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
              <MenuItems
                menuItems={adminSidebarMenuItems}
                setOpen={setOpen}
                isMobile={true}
              />
              <div className="pt-4 border-t">
                <MenuItems
                  menuItems={bottomMenuItems}
                  setOpen={setOpen}
                  isMobile={true}
                />
              </div>
            </div>

            <div className="border-t border-border/70 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-xl text-red-600 hover:bg-red-500/10 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                v1.0.0
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ✅ Desktop Sidebar */}
      <aside className="fixed z-10 hidden h-screen w-[280px] flex-col border-r border-border/70 bg-background/95 shadow-[12px_0_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-3 border-b border-border/70 p-5 transition hover:bg-accent/50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Operations hub</p>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <MenuItems menuItems={adminSidebarMenuItems} />
          <div className="pt-4 border-t">
            <MenuItems menuItems={bottomMenuItems} />
          </div>
        </div>

        <div className="border-t border-border/70 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-red-600 hover:bg-red-500/10 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
          {/* <p className="text-xs text-muted-foreground text-center mt-2">v1.0.0</p> */}
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
