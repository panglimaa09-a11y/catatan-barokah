import { Link, useLocation } from "react-router-dom";
import { Egg, LayoutDashboard, ArrowDownUp, ReceiptText, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/transaksi", label: "Transaksi", icon: ArrowDownUp, testid: "nav-transaksi" },
  { to: "/nota", label: "Nota", icon: ReceiptText, testid: "nav-nota" },
];

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <header className="sticky top-0 z-40 border-b border-amber-900/10 bg-[#faf9f5]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/dashboard"
            data-testid="brand-logo"
            className="flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 text-white shadow-lg shadow-amber-600/25">
              <Egg className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-stone-900">
              Catatan<span className="text-amber-600">Barokah</span>
              <span className="ml-1 text-xs font-sans font-semibold uppercase tracking-widest text-amber-700/70">
                Telur
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-testid={item.testid}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-300",
                    active
                      ? "bg-stone-900 text-amber-300 shadow-md"
                      : "text-stone-500 hover:bg-amber-500/10 hover:text-amber-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/"
              data-testid="nav-beranda"
              aria-label="Kembali ke beranda"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-amber-500/10 hover:text-amber-700"
            >
              <Home className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
