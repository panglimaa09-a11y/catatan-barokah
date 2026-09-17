import axios from "axios";

export const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API_URL });

export const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const formatTanggal = (d) => {
  if (!d) return "-";
  const date = new Date(d.length === 10 ? d + "T00:00:00" : d);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatJam = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const KATEGORI_MASUK = [
  "Penjualan Grosir",
  "Penjualan Warung",
  "Penjualan Retail",
  "Lain-lain",
];

export const KATEGORI_KELUAR = [
  "Pembelian Telur",
  "Pakan Ayam",
  "Gaji & Upah",
  "Transportasi",
  "Operasional",
  "Lain-lain",
];

export const SATUAN = ["peti", "rak", "kg", "butir"];
