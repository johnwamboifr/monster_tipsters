import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminHeader from "./header";
import AdminSideBar from "./sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setOpenSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {openSidebar && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[280px]">
        <AdminHeader setOpen={setOpenSidebar} />

        <main className={cn("flex-1 bg-background/70 p-4 md:p-6 lg:p-8", "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_30%)]")}> 
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="overflow-x-auto rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default AdminLayout;