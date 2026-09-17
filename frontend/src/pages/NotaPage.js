import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  Plus,
  Printer,
  BadgeCheck,
  ReceiptText,
  Inbox,
} from "lucide-react";
import {
  api,
  formatRupiah,
  formatTanggal,
  formatJam,
  SATUAN,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const blankItem = () => ({ name: "", qty: 1, unit: "peti", price: 0 });

export function NotaStruk({ nota, draft }) {
  return (
    <div className="font-struk mx-auto w-full max-w-xs bg-white p-6 text-[11px] leading-relaxed text-stone-800 shadow-inner">
      <div className="border-b border-dashed border-stone-400 pb-3 text-center">
        <p className="font-display text-base font-bold tracking-wide">
          CatatanBarokah Telur
        </p>
        <p className="mt-0.5 text-[10px] text-stone-500">
          Nota Penjualan Telur
        </p>
      </div>
      <div className="mt-3 space-y-0.5 text-[10px]">
        <p>
          No: <span className="font-bold">{draft ? "NT-DRAFT" : nota.number}</span>
        </p>
        <p>
          Tanggal: {formatTanggal(nota.date)}{" "}
          {nota.created_at ? formatJam(nota.created_at) : ""}
        </p>
        <p>Pelanggan: {nota.customer_name || "-"}</p>
        {nota.customer_phone ? <p>No. HP: {nota.customer_phone}</p> : null}
      </div>
      <div className="mt-3 border-y border-dashed border-stone-400 py-2">
        {nota.items.map((it, i) => (
          <div key={i} className="flex justify-between gap-2 py-0.5">
            <span className="min-w-0">
              <span className="font-semibold">{it.name || "Item"}</span>
              <br />
              <span className="text-[10px] text-stone-500">
                {it.qty} {it.unit} x {formatRupiah(it.price)}
              </span>
            </span>
            <span className="shrink-0 text-right font-semibold">
              {formatRupiah(it.qty * it.price)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>{formatRupiah(nota.total)}</span>
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase">
        <span>Status</span>
        <span
          className={
            nota.status === "lunas" ? "font-bold text-emerald-700" : "font-bold text-amber-700"
          }
        >
          {nota.status === "lunas" ? "LUNAS" : "BELUM LUNAS"}
        </span>
      </div>
      {nota.note ? (
        <p className="mt-2 border-t border-dashed border-stone-400 pt-2 text-[10px] italic text-stone-500">
          {nota.note}
        </p>
      ) : null}
      <p className="mt-3 border-t border-dashed border-stone-400 pt-3 text-center text-[10px]">
        Terima kasih — Semoga Barokah
      </p>
    </div>
  );
}

export default function NotaPage() {
  const queryClient = useQueryClient();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [status, setStatus] = useState("belum");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [printNota, setPrintNota] = useState(null);

  const { data: notas = [], isLoading } = useQuery({
    queryKey: ["nota"],
    queryFn: async () => (await api.get("/nota")).data,
  });

  const total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);

  const previewNota = {
    number: "NT-DRAFT",
    customer_name: customerName,
    customer_phone: customerPhone,
    items: items.map((i) => ({ ...i, qty: Number(i.qty) || 0, price: Number(i.price) || 0 })),
    total,
    status,
    note,
    date,
  };

  const createNota = useMutation({
    mutationFn: async (withPrint) => {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        items: items
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            qty: Number(i.qty) || 0,
            unit: i.unit,
            price: Number(i.price) || 0,
          })),
        status,
        note: note.trim(),
        date,
      };
      const res = await api.post("/nota", payload);
      return { nota: res.data, withPrint };
    },
    onSuccess: ({ nota, withPrint }) => {
      queryClient.invalidateQueries({ queryKey: ["nota"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Nota ${nota.number} tersimpan`);
      setCustomerName("");
      setCustomerPhone("");
      setItems([blankItem()]);
      setNote("");
      setStatus("belum");
      if (withPrint) {
        setPrintNota(nota);
        setTimeout(() => window.print(), 350);
      }
    },
    onError: (e) =>
      toast.error(e?.response?.data?.detail || "Gagal menyimpan nota"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) =>
      (await api.put(`/nota/${id}/status`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nota"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Status nota diperbarui");
    },
  });

  const deleteNota = useMutation({
    mutationFn: async (id) => api.delete(`/nota/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nota"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Nota dihapus");
    },
  });

  const setItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const handleSave = (withPrint) => {
    if (!customerName.trim()) {
      toast.error("Isi nama pelanggan terlebih dahulu");
      return;
    }
    if (!items.some((i) => i.name.trim())) {
      toast.error("Tambahkan minimal 1 item");
      return;
    }
    createNota.mutate(withPrint);
  };

  const doPrint = (nota) => {
    setPrintNota(nota);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-8" data-testid="nota-page">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Nota</h1>
        <p className="mt-1 text-sm text-stone-500">
          Buat nota digital bergaya struk thermal — siap dicetak.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-lg">Nota Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Nama Pelanggan
                </label>
                <Input
                  data-testid="nota-customer-input"
                  placeholder="cth. Warung Bu Siti"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  No. HP (opsional)
                </label>
                <Input
                  data-testid="nota-phone-input"
                  placeholder="08xx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Item Telur
                </label>
                <Button
                  type="button"
                  data-testid="nota-add-item-button"
                  onClick={() => setItems((p) => [...p, blankItem()])}
                  variant="outline"
                  className="h-8 rounded-full border-amber-500/40 text-xs font-bold text-amber-700 hover:bg-amber-500/10"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Item
                </Button>
              </div>
              <div className="space-y-2.5">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    data-testid={`nota-item-row-${idx}`}
                    className="grid grid-cols-12 items-center gap-2 rounded-xl bg-stone-50 p-2.5"
                  >
                    <Input
                      data-testid={`nota-item-name-${idx}`}
                      placeholder="Nama item (cth. Telur Negeri)"
                      value={it.name}
                      onChange={(e) => setItem(idx, "name", e.target.value)}
                      className="col-span-12 h-9 rounded-lg bg-white sm:col-span-5"
                    />
                    <Input
                      data-testid={`nota-item-qty-${idx}`}
                      type="number"
                      min="0"
                      value={it.qty}
                      onChange={(e) => setItem(idx, "qty", e.target.value)}
                      className="col-span-3 h-9 rounded-lg bg-white sm:col-span-2"
                      aria-label="Jumlah"
                    />
                    <div className="col-span-3 sm:col-span-2">
                      <Select value={it.unit} onValueChange={(v) => setItem(idx, "unit", v)}>
                        <SelectTrigger
                          data-testid={`nota-item-unit-${idx}`}
                          className="h-9 rounded-lg bg-white"
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
                    <Input
                      data-testid={`nota-item-price-${idx}`}
                      type="number"
                      min="0"
                      placeholder="Harga"
                      value={it.price}
                      onChange={(e) => setItem(idx, "price", e.target.value)}
                      className="col-span-4 h-9 rounded-lg bg-white sm:col-span-2"
                      aria-label="Harga satuan"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`nota-remove-item-${idx}`}
                      aria-label="Hapus item"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((p) => p.filter((_, i) => i !== idx))
                      }
                      className="col-span-2 h-9 w-9 text-stone-300 hover:bg-red-50 hover:text-red-600 sm:col-span-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="nota-status-select" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum">Belum Lunas</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Tanggal
                </label>
                <Input
                  data-testid="nota-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-xl bg-amber-500/10 px-4 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Total
                  </p>
                  <p
                    data-testid="nota-total-preview"
                    className="text-lg font-extrabold text-amber-800"
                  >
                    {formatRupiah(total)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Catatan (opsional)
              </label>
              <Textarea
                data-testid="nota-note-input"
                placeholder="cth. Diambil sore nanti"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-xl"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                data-testid="nota-save-button"
                disabled={createNota.isPending}
                onClick={() => handleSave(false)}
                className="h-12 flex-1 rounded-xl bg-stone-900 text-base font-bold text-amber-300 shadow-lg hover:bg-stone-800"
              >
                {createNota.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <BadgeCheck className="h-5 w-5" /> Simpan Nota
                  </>
                )}
              </Button>
              <Button
                data-testid="nota-save-print-button"
                disabled={createNota.isPending}
                onClick={() => handleSave(true)}
                className="h-12 flex-1 rounded-xl bg-amber-500 text-base font-bold text-stone-950 shadow-lg shadow-amber-600/25 hover:bg-amber-400"
              >
                <Printer className="h-5 w-5" /> Simpan & Cetak
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview struk */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
              Pratinjau Struk
            </p>
            <div className="rounded-2xl bg-stone-200/70 p-4">
              <NotaStruk nota={previewNota} draft />
            </div>
          </div>
        </div>
      </div>

      {/* Daftar nota */}
      <Card className="rounded-2xl border-amber-900/10 shadow-lg shadow-amber-950/5">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <ReceiptText className="h-5 w-5 text-amber-600" /> Daftar Nota
            Tersimpan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : notas.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 py-12 text-stone-400"
              data-testid="empty-nota"
            >
              <Inbox className="h-8 w-8" />
              <p className="text-sm">Belum ada nota tersimpan</p>
            </div>
          ) : (
            <ul className="divide-y divide-amber-900/5" data-testid="nota-list">
              {notas.map((n) => (
                <li
                  key={n.id}
                  data-testid="nota-row"
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-struk text-sm font-bold">{n.number}</p>
                    <p className="truncate text-sm font-semibold">
                      {n.customer_name}{" "}
                      <span className="font-normal text-stone-400">
                        — {n.items.length} item • {formatTanggal(n.date)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm font-extrabold text-stone-900">
                      {formatRupiah(n.total)}
                    </span>
                    <Badge
                      data-testid={`nota-status-${n.id}`}
                      className={
                        n.status === "lunas"
                          ? "rounded-full bg-emerald-500/10 text-emerald-700"
                          : "rounded-full bg-amber-500/15 text-amber-800"
                      }
                    >
                      {n.status === "lunas" ? "Lunas" : "Belum Lunas"}
                    </Badge>
                    {n.status !== "lunas" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid="nota-lunas-button"
                        aria-label={`Tandai lunas ${n.number}`}
                        onClick={() =>
                          updateStatus.mutate({ id: n.id, status: "lunas" })
                        }
                        className="h-8 w-8 text-stone-300 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <BadgeCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid="nota-print-button"
                      aria-label={`Cetak ${n.number}`}
                      onClick={() => doPrint(n)}
                      className="h-8 w-8 text-stone-300 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid="nota-delete-button"
                      aria-label={`Hapus nota ${n.number}`}
                      onClick={() => deleteNota.mutate(n.id)}
                      className="h-8 w-8 text-stone-300 hover:bg-red-50 hover:text-red-600"
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

      {/* Area cetak */}
      {printNota && (
        <div className="print-area" data-testid="print-area">
          <NotaStruk nota={printNota} />
        </div>
      )}
    </div>
  );
}
