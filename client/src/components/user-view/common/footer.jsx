import React from "react";
import { FaHeadset, FaExchangeAlt } from "react-icons/fa";

const UserFooter = () => {
  return (
    <footer className="py-10 text-sm text-slate-400">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <h4 className="mb-3 text-base font-semibold text-white">About Us</h4>
            <p className="text-[13px] leading-relaxed text-slate-300">
              We deliver expert-driven football insights and high-conviction
              predictions for fans who want more than the average picks.
            </p>

            <div className="mt-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2H17C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[12px] text-slate-400">
                  Customer Support
                </p>
                <p className="text-sm font-medium text-white">
                  +254 708 048 110
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-base font-semibold text-white">
              Quick Links
            </h4>

            <ul className="space-y-2 text-[13px]">
              {["Home", "About", "Contact"].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="transition-colors hover:text-emerald-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-3 text-base font-semibold text-white">
              Customer Service
            </h4>

            <ul className="space-y-2 text-[13px]">
              <li className="flex items-center space-x-2">
                <FaHeadset className="text-emerald-300" />
                <a href="#" className="hover:text-white">
                  Help & Support
                </a>
              </li>

              <li className="flex items-center space-x-2">
                <FaExchangeAlt className="text-emerald-300" />
                <a href="#" className="hover:text-white">
                  Returns & Exchanges
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-white/10 pt-5 text-[12px] sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Monster Tipsters. All rights
            reserved.
          </p>

          <div className="mt-3 flex space-x-4 sm:mt-0">
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
