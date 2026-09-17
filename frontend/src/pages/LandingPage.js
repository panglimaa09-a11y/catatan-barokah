import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Egg,
  ArrowRight,
  LayoutDashboard,
  ArrowDownUp,
  ReceiptText,
  Wallet,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import Egg3DScene from "@/components/Egg3DScene";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const FITUR = [
  {
    testid: "feature-card-dashboard",
    icon: LayoutDashboard,
    title: "Dashboard Nagih",
    desc: "Pemasukan, pengeluaran, saldo bersih, dan peti telur terjual tampil jelas dalam satu layar dengan grafik aliran kas 7 hari.",
  },
  {
    testid: "feature-card-transaksi",
    icon: ArrowDownUp,
    title: "Uang Masuk & Keluar",
    desc: "Catat penjualan grosir, warung, retail, atau biaya pakan & operasional. Cari, filter, dan hapus dengan sekali klik.",
  },
  {
    testid: "feature-card-nota",
    icon: ReceiptText,
    title: "Nota Digital Siap Cetak",
    desc: "Buat nota pelanggan bergaya struk thermal dengan hitungan peti, rak, kg, sampai butir — langsung cetak dari browser.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#141210]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 text-white shadow-lg shadow-amber-600/30">
              <Egg className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-stone-50">
              Catatan<span className="text-amber-400">Barokah</span>
              <span className="ml-1 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-amber-500/80">
                Telur
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#fitur"
              data-testid="landing-nav-fitur"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-stone-300 transition-colors hover:text-amber-400 sm:block"
            >
              Fitur
            </a>
            <Button
              asChild
              data-testid="landing-nav-cta"
              className="rounded-full bg-amber-500 text-stone-950 shadow-lg shadow-amber-600/30 transition-all hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <Link to="/dashboard">
                Buka Aplikasi <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero anti-gravitasi */}
      <section className="relative overflow-hidden bg-[#141210]">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/20 blur-[140px] animate-glow-pulse" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-700/20 blur-[100px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(245,158,11,0.14) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.14 }}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-amber-400"
            >
              <Egg className="h-3.5 w-3.5" />
              Catatan Keuangan Usaha Telur
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-stone-50 sm:text-5xl lg:text-6xl"
            >
              Keuangan Telur Anda,{" "}
              <span className="gold-gradient-text italic">Melayang Rapi</span>{" "}
              Tanpa Gravitasi
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone-400 sm:text-lg lg:mx-0"
            >
              CatatanBarokah Telur mencatat uang masuk, uang keluar, dan nota
              pelanggan usaha telur Anda — otomatis, rapi, dan penuh keberkahan.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center"
            >
              <Button
                asChild
                data-testid="landing-cta-mulai"
                size="lg"
                className="group rounded-full bg-amber-500 px-8 text-base font-bold text-stone-950 shadow-xl shadow-amber-600/40 transition-all hover:-translate-y-1 hover:bg-amber-400"
              >
                <Link to="/dashboard">
                  Mulai Catatan Sekarang
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                data-testid="landing-cta-fitur"
                size="lg"
                variant="outline"
                className="rounded-full border-amber-500/40 bg-transparent px-8 text-base font-semibold text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
              >
                <a href="#fitur">Lihat Fitur</a>
              </Button>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center justify-center gap-6 text-sm text-stone-500 lg:justify-start"
            >
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-500" /> Data aman
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-amber-500" /> Saldo real-time
              </span>
              <span className="flex items-center gap-1.5">
                <ReceiptText className="h-4 w-4 text-amber-500" /> Nota cetak
              </span>
            </motion.div>
          </motion.div>

          <div className="relative h-[380px] sm:h-[460px]">
            <Egg3DScene />
            <div className="animate-antigravity pointer-events-none absolute left-0 top-10 hidden rounded-2xl border border-amber-500/25 bg-[#1c1917]/85 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <Wallet className="h-4 w-4 text-amber-400" />
                Saldo terjaga
              </div>
              <p className="text-xs text-stone-400">Masuk & keluar tercatat</p>
            </div>
            <div className="animate-antigravity-delay-1 pointer-events-none absolute right-0 top-24 hidden rounded-2xl border border-emerald-500/25 bg-[#1c1917]/85 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Laba naik
              </div>
              <p className="text-xs text-stone-400">Grafik aliran kas harian</p>
            </div>
            <div className="animate-antigravity-delay-2 pointer-events-none absolute bottom-12 left-6 hidden rounded-2xl border border-amber-500/25 bg-[#1c1917]/85 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <Egg className="h-4 w-4 text-amber-400" />
                Peti terdata
              </div>
              <p className="text-xs text-stone-400">Stok terjual otomatis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
            Tiga Sayap Anti-Gravitasi
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Semua Kebutuhan Usaha Telur, dalam Satu Tempat
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FITUR.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.testid}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
                data-testid={f.testid}
                className="tilt-card rounded-2xl border border-amber-900/10 bg-white p-8 shadow-xl shadow-amber-950/5"
              >
                <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 text-white shadow-lg shadow-amber-600/30">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#141210] py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[560px] -translate-x-1/2 rounded-full bg-amber-500/25 blur-[120px] animate-glow-pulse" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Egg className="animate-antigravity mx-auto h-12 w-12 text-amber-400" />
          <h2 className="font-display mt-6 text-3xl font-bold text-stone-50 sm:text-4xl">
            Titipkan Catatan pada yang Rapi, Panen{" "}
            <span className="gold-gradient-text italic">Barokah</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-400">
            Mulai hari ini: catat tiap peti yang terjual, tiap rupiah yang
            keluar, dan setiap nota pelanggan — semua melayang tertata rapi.
          </p>
          <Button
            asChild
            data-testid="landing-cta-akhir"
            size="lg"
            className="mt-8 rounded-full bg-amber-500 px-10 text-base font-bold text-stone-950 shadow-xl shadow-amber-600/40 transition-all hover:-translate-y-1 hover:bg-amber-400"
          >
            <Link to="/dashboard">
              Buka Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-amber-900/10 bg-[#faf9f5] py-8">
        <p className="text-center text-sm text-stone-500">
          © 2026 CatatanBarokah Telur — Catatan keuangan usaha telur Anda.
        </p>
      </footer>
    </div>
  );
}
