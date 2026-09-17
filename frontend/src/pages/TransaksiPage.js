import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Search, Inbox, ArrowDownUp } from "lucide-react";
import { api, formatRupiah, formatTanggal, KATEGORI_MASUK, KATEGORI_KELUAR, SATUAN } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function TransaksiPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState("masuk");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(KATEGORI_MASUK[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("peti");
  const [filterType, setFilterType] = useState("semua");
  const [search, setSearch] = useState("");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await api.get("/transactions")).data,
  });
  const { data: dash } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });

  const kategori = type === "masuk" ? KATEGORI_MASUK : KATEGORI_KELUAR;

  const createTx = useMutation({
    mutationFn: async () => {
      const payload = {
        type,
        amount: Number(amount),
        category,
        description: description.trim(),
        date,
        qty: qty === "" ? null : Number(qty),
        unit: qty === "" ? null : unit,
      };
      return (await api.post("/transactions", payload)).data;
    },
    onSuccess: (tx) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(
        `${tx.type === "masuk" ? "Uang masuk" : "Uang keluar"} ${formatRupiah(
          tx.amount
        )} tersimpan`
      );
      setAmount("");
      setDescription("");
      setQty("");
    },
    onError: (e) =>
      toast.error(e?.response?.data?.detail || "Gagal menyimpan transaksi"),
  });

  const deleteTx = useMutation({
    mutationFn: async (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaksi dihapus");
    },
  });

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "semua" && t.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${t.description} ${t.category} ${t.amount}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filterType, search]);

  const switchType = (t) => {
    setType(t);
    setCategory(t === "masuk" ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0]);
  };

  return (
    <div className="space-y-8" data-testid="transaksi-page">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Uang Masuk & Keluar
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Catat setiap rupiah usaha telur Anda.
        </p>
      </div>

      {/* Ringkasan */}
      <div className="flex flex-wrap gap-3">
        <div
          data-testid="tx-summary-masuk"
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Total Masuk
          </p>
          <p className="text-lg font-extrabold text-emerald-600">
            {formatRupiah(dash?.total_masuk)}
          </p>
        </div>
        <div
          data-testid="tx-summary-keluar"
          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-red-700">
            Total Keluar
          </p>
          <p className="text-lg font-extrabold text-red-600">
            {formatRupiah(dash?.total_keluar)}
          </p>
        </div>
        <div
          data-testid="tx-summary-saldo"
          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Saldo
          </p>
          <p className="text-lg font-extrabold text-amber-700">
            {formatRupiah(dash?.saldo)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="h-fit rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Transaksi Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-full bg-stone-100 p-1">
              <button
                type="button"
                data-testid="tx-type-masuk"
                onClick={() => switchType("masuk")}
                className={cn(
                  "rounded-full py-2 text-sm font-bold transition-all duration-300",
                  type === "masuk"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-stone-500 hover:text-emerald-600"
                )}
              >
                Uang Masuk
              </button>
              <button
                type="button"
                data-testid="tx-type-keluar"
                onClick={() => switchType("keluar")}
                className={cn(
                  "rounded-full py-2 text-sm font-bold transition-all duration-300",
                  type === "keluar"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-stone-500 hover:text-red-600"
                )}
              >
                Uang Keluar
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Nominal (Rp)
              </label>
              <Input
                data-testid="tx-amount-input"
                type="number"
                min="0"
                placeholder="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 rounded-xl text-lg font-bold"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Kategori
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  data-testid="tx-category-select"
                  className="h-11 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kategori.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Jumlah {type === "masuk" ? "terjual" : "dibeli"} (opsional)
                </label>
                <Input
                  data-testid="tx-qty-input"
                  type="number"
                  min="0"
                  placeholder="cth. 10"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Satuan
                </label>
                <Select
                  value={unit}
                  onValueChange={setUnit}
                  disabled={qty === ""}
                >
                  <SelectTrigger
                    data-testid="tx-unit-select"
                    className="h-11 rounded-xl"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SATUAN.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Keterangan
              </label>
              <Input
                data-testid="tx-description-input"
                placeholder="cth. Jual ke warung Bu Siti"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Tanggal
              </label>
              <Input
                data-testid="tx-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <Button
              data-testid="tx-submit-button"
              disabled={createTx.isPending || !amount}
              onClick={() => createTx.mutate()}
              className={cn(
                "h-12 w-full rounded-xl text-base font-bold shadow-lg transition-all hover:-translate-y-0.5",
                type === "masuk"
                  ? "bg-emerald-500 shadow-emerald-600/25 hover:bg-emerald-400"
                  : "bg-red-500 shadow-red-600/25 hover:bg-red-400"
              )}
            >
              {createTx.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Simpan ${type === "masuk" ? "Masuk" : "Keluar"}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Daftar transaksi */}
        <Card className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5 lg:col-span-3">
          <CardHeader className="gap-4">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-amber-600" /> Daftar
              Transaksi
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  data-testid="tx-search-input"
                  placeholder="Cari keterangan / kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 rounded-xl pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger
                  data-testid="tx-filter-select"
                  className="h-10 w-full rounded-xl sm:w-40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem>
                  <SelectItem value="masuk">Masuk</SelectItem>
                  <SelectItem value="keluar">Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 py-12 text-stone-400"
                data-testid="empty-transactions"
              >
                <Inbox className="h-8 w-8" />
                <p className="text-sm">Belum ada transaksi yang cocok</p>
              </div>
            ) : (
              <ul className="divide-y divide-amber-900/5" data-testid="tx-list">
                {filtered.map((t) => (
                  <li
                    key={t.id}
                    data-testid="tx-row"
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          t.type === "masuk"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                        )}
                      >
                        <ArrowDownUp className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {t.description || t.category}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-amber-500/10 text-[11px] font-semibold text-amber-800"
                          >
                            {t.category}
                          </Badge>
                          {t.qty != null && (
                            <span className="text-[11px] text-stone-400">
                              {t.qty} {t.unit}
                            </span>
                          )}
                          <span className="text-[11px] text-stone-400">
                            {formatTanggal(t.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-extrabold",
                          t.type === "masuk" ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {t.type === "masuk" ? "+" : "-"}
                        {formatRupiah(t.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid="tx-delete-button"
                        aria-label={`Hapus transaksi ${t.description || t.category}`}
                        onClick={() => deleteTx.mutate(t.id)}
                        className="h-8 w-8 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
