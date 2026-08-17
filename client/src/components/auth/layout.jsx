import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col overflow-hidden lg:flex-row">
        <div className="hidden lg:flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_35%),linear-gradient(180deg,#020617_0%,#10212c_100%)] px-12 py-16">
          <div className="max-w-xl rounded-[36px] border border-white/10 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Monster Tipsters
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Secure access, premium insights, and smooth authentication.
            </h1>
            <p className="mt-4 leading-7 text-slate-300">
              Modern login, registration, and password recovery flows designed for both dark and light mode. OTP-based resets keep your users secure without links.
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
