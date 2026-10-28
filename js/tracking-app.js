// tracking-app.js — logika Vue untuk halaman tracking.html
// buat delivery order baru + cari status pengiriman

// tanggal hari ini format YYYY-MM-DD, jadi nilai awal kolom tanggal kirim
function tanggalHariIni() {
  const d = new Date();
  const dua = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + dua(d.getMonth() + 1) + "-" + dua(d.getDate());
}

Vue.createApp({
  data() {
    return {
      daftarTracking: { ...dataBahanAjar.tracking },
      pengirimanList: dataBahanAjar.pengirimanList,
      paketList: dataBahanAjar.paket,

      // form delivery order baru
      formDO: {
        nim: "",
        nama: "",
        ekspedisi: "",
        kodePaket: "",
        tanggalKirim: tanggalHariIni() // default hari ini, tetap bisa diubah
      },
      pesanDO: "",
      pesanDOSukses: false,

      // form pencarian tracking
      nomorDO: "",
      hasil: null,
      pesanError: ""
    };
  },

  computed: {
    // nomor DO berikutnya: DO + tahun berjalan + nomor urut.
    // urutannya dilanjutkan dari nomor terbesar di tahun yang sama,
    // lebar digitnya mengikuti data yang sudah ada (0001 menjadi 0002)
    nomorBaru() {
      const tahun = new Date().getFullYear();
      let urutan = 0;
      let lebar = 3;
      for (const nomor of Object.keys(this.daftarTracking)) {
        const cocok = nomor.match(/^DO(\d{4})-(\d+)$/);
        if (cocok && Number(cocok[1]) === tahun) {
          urutan = Math.max(urutan, Number(cocok[2]));
          lebar = Math.max(lebar, cocok[2].length);
        }
      }
      return "DO" + tahun + "-" + String(urutan + 1).padStart(lebar, "0");
    },

    // paket yang sedang dipilih di form, dipakai untuk detail isi paket
    paketTerpilih() {
      return this.paketList.find((p) => p.kode === this.formDO.kodePaket) || null;
    },

    // total harga DO baru otomatis mengikuti harga paketnya
    totalBaru() {
      return this.paketTerpilih ? this.paketTerpilih.harga : 0;
    },

    // persen progress untuk progress bar pengiriman
    statusPersen() {
      if (!this.hasil) return 0;
      const logAkhir = this.hasil.perjalanan[this.hasil.perjalanan.length - 1].keterangan;
      if (logAkhir.includes("Selesai Antar")) return 100;
      if (this.hasil.status === "Dalam Perjalanan") return 60;
      if (this.hasil.status === "Diproses") return 20;
      return 30;
    },

    daftarPerjalanan() {
      return this.hasil ? this.hasil.perjalanan : [];
    }
  },

  watch: {
    // hasil lama dibuang pas nomor diketik ulang, biar tidak salah baca
    nomorDO() {
      this.hasil = null;
      this.pesanError = "";
    },

    // begitu hasil ketemu, halaman otomatis digulir ke kartu hasil
    hasil(nilaiBaru) {
      if (nilaiBaru) {
        this.$nextTick(() => {
          const kartu = document.querySelector(".kartu-hasil");
          if (kartu) kartu.scrollIntoView({ behavior: "smooth" });
        });
      }
    },

    // pesan lama dibersihkan tiap kali pilihan paket diganti
    "formDO.kodePaket"() {
      this.pesanDO = "";
    }
  },

  methods: {
    formatRupiah(angka) {
      return "Rp " + Number(angka || 0).toLocaleString("id-ID");
    },

    namaEkspedisi(kode) {
      const e = this.pengirimanList.find((x) => x.kode === kode);
      return e ? e.nama : kode;
    },

    namaPaket(kode) {
      const p = this.paketList.find((x) => x.kode === kode);
      return p ? p.nama : "";
    },

    waktuSekarang() {
      const d = new Date();
      const dua = (n) => String(n).padStart(2, "0");
      return d.getFullYear() + "-" + dua(d.getMonth() + 1) + "-" + dua(d.getDate()) +
        " " + dua(d.getHours()) + ":" + dua(d.getMinutes()) + ":" + dua(d.getSeconds());
    },

    // escape karakter html sebelum teks pengguna digabung ke pesan v-html
    escapeHtml(teks) {
      return String(teks).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
      );
    },

    simpanDO() {
      const f = this.formDO;

      if (!f.nim || !f.nama || !f.ekspedisi || !f.kodePaket || !f.tanggalKirim) {
        this.pesanDO = "Semua kolom wajib diisi.";
        this.pesanDOSukses = false;
        return;
      }
      if (!/^\d+$/.test(f.nim)) {
        this.pesanDO = "NIM hanya boleh berisi angka.";
        this.pesanDOSukses = false;
        return;
      }

      this.daftarTracking[this.nomorBaru] = {
        nim: f.nim,
        nama: f.nama,
        status: "Diproses",
        ekspedisi: f.ekspedisi,
        tanggalKirim: f.tanggalKirim,
        paket: f.kodePaket,
        total: this.totalBaru,
        perjalanan: [
          {
            waktu: this.waktuSekarang(),
            keterangan: "Delivery order dibuat oleh operator SITTA - menunggu pickup"
          }
        ]
      };

      this.pesanDO =
        "Delivery order " + this.nomorBaru + " untuk " + f.nama + " berhasil dibuat.";
      this.pesanDOSukses = true;

      // form dikosongkan, nomor DO di form otomatis naik satu
      this.formDO.nim = "";
      this.formDO.nama = "";
      this.formDO.ekspedisi = "";
      this.formDO.kodePaket = "";
    },

    cari() {
      if (!this.nomorDO) {
        this.pesanError = "Nomor delivery order wajib diisi.";
        return;
      }

      const nomor = this.nomorDO.toUpperCase();
      const ditemukan = this.daftarTracking[nomor];

      if (!ditemukan) {
        this.pesanError =
          "Nomor delivery order <strong>" + this.escapeHtml(nomor) +
          "</strong> tidak ditemukan.";
        this.hasil = null;
        return;
      }

      // nomor DO ikut disimpan supaya bisa ditampilkan di kartu hasil
      this.hasil = { ...ditemukan, nomorDO: nomor };
    }
  }
}).mount("#app-tracking");
