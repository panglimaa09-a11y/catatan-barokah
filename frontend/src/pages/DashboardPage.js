import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Egg,
  Loader2,
  ReceiptText,
  ArrowDownUp,
  Inbox,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api, formatRupiah, formatTanggal } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["#d97706", "#10b981", "#f97316", "#0ea5e9", "#8b5cf6", "#ef4444"];

const fmtDay = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-stone-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Memuat dashboard...
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
        Gagal memuat data dashboard.
      </div>
    );

  const stats = [
    {
      testid: "stat-card-masuk",
      label: "Pemasukan",
      value: formatRupiah(data.total_masuk),
      icon: TrendingUp,
      cls: "bg-emerald-500/10 text-emerald-600",
    },
    {
      testid: "stat-card-keluar",
      label: "Pengeluaran",
      value: formatRupiah(data.total_keluar),
      icon: TrendingDown,
      cls: "bg-red-500/10 text-red-600",
    },
    {
      testid: "stat-card-saldo",
      label: "Saldo Bersih",
      value: formatRupiah(data.saldo),
      icon: Wallet,
      cls: "bg-amber-500/10 text-amber-600",
    },
    {
      testid: "stat-card-peti",
      label: "Peti Terjual",
      value: `${Math.round(data.peti_terjual)} peti`,
      icon: Egg,
      cls: "bg-stone-900/5 text-stone-800",
    },
  ];

  const pieData = data.categories.filter((c) => c.keluar > 0);

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Ringkasan keuangan usaha telur Anda hari ini.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            data-testid="quick-action-transaksi"
            className="rounded-full bg-amber-500 font-bold text-stone-950 hover:bg-amber-400"
          >
            <Link to="/transaksi">
              <ArrowDownUp className="h-4 w-4" /> Catat Transaksi
            </Link>
          </Button>
          <Button
            asChild
            data-testid="quick-action-nota"
            variant="outline"
            className="rounded-full border-stone-900 font-semibold hover:bg-stone-900 hover:text-amber-300"
          >
            <Link to="/nota">
              <ReceiptText className="h-4 w-4" /> Buat Nota
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.testid}
              data-testid={s.testid}
              className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.cls}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {s.label}
                  </p>
                  <p className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
                    {s.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info nota belum lunas */}
      {data.nota_unpaid > 0 && (
        <Link to="/nota" className="block" data-testid="info-nota-belum-lunas">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 transition-colors hover:bg-amber-100">
            <ReceiptText className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">
              Ada {data.nota_unpaid} nota belum lunas senilai{" "}
              {formatRupiah(data.nota_unpaid_total)} — ketuk untuk membuka
              halaman Nota.
            </p>
          </div>
        </Link>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-lg" data-testid="chart-cashflow">
              Aliran Kas 7 Hari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="gMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="gKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDay}
                  tick={{ fontSize: 12, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${v / 1000000}jt`
                      : v >= 1000
                      ? `${v / 1000}rb`
                      : v
                  }
                  tick={{ fontSize: 12, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  formatter={(v, name) => [
                    formatRupiah(v),
                    name === "masuk" ? "Masuk" : "Keluar",
                  ]}
                  labelFormatter={(l) => formatTanggal(l)}
                />
                <Area
                  type="monotone"
                  dataKey="masuk"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gMasuk)"
                />
                <Area
                  type="monotone"
                  dataKey="keluar"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#gKeluar)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg" data-testid="chart-kategori">
              Pengeluaran per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-stone-400">
                <Inbox className="h-8 w-8" />
                <p className="text-sm">Belum ada pengeluaran tercatat</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="keluar"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatRupiah(v)} />
                  <Legend
                    formatter={(v) => (
                      <span className="text-xs text-stone-600">{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Transaksi Terbaru</CardTitle>
          <Button asChild variant="ghost" className="text-amber-700 hover:text-amber-800">
            <Link to="/transaksi">Lihat semua</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 py-10 text-stone-400"
              data-testid="empty-recent-transactions"
            >
              <Inbox className="h-8 w-8" />
              <p className="text-sm">
                Belum ada transaksi. Mulai catat di tab Transaksi!
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-amber-900/5" data-testid="recent-transactions-list">
              {data.recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {t.description || t.category}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-amber-500/10 text-[11px] font-semibold text-amber-800"
                      >
                        {t.category}
                      </Badge>
                      <span className="text-xs text-stone-400">
                        {formatTanggal(t.date)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-extrabold ${
                      t.type === "masuk" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "masuk" ? "+" : "-"}
                    {formatRupiah(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
