import { Outlet } from "react-router-dom";
import UserHeader from "./header";
import UserFooter from "./footer";

function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <UserHeader />
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/70">
        <UserFooter />
      </footer>
    </div>
  );
}

export default UserLayout;