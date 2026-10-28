// stok-app.js — logika Vue untuk halaman stok.html
// tampil daftar stok + filter & sort + tambah, ubah, hapus stok

Vue.createApp({
  data() {
    return {
      // daftar stok di-copy dari dummy data biar data aslinya tidak ikut kegeser
      daftarStok: dataBahanAjar.stok.map((b) => ({ ...b })),
      upbjjList: dataBahanAjar.upbjjList,
      kategoriList: dataBahanAjar.kategoriList,

      // filter & sort
      fUpbjj: "",      // UT-Daerah terpilih, kosong berarti semua
      fKategori: "",   // filter kategori baru muncul setelah UT-Daerah dipilih
      fReorder: false, // dicentang = tampilkan yang perlu re-order saja
      sortBy: "",      // kosong / judul / qty / harga

      // form tambah & ubah stok
      formStok: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ""
      },

      editIndex: -1,      // -1 berarti form sedang mode tambah, bukan ubah
      pesanStok: "",
      pesanSukses: false,
      waktuPembaruan: "-" // diisi watcher tiap kali isi daftar berubah
    };
  },

  computed: {
    // daftar yang sudah difilter dan diurutkan.
    // sengaja pakai computed: hasilnya di-cache vue, jadi penyaringan tidak
    // dihitung ulang setiap render, cukup saat data atau filternya berubah
    daftarTersaring() {
      let hasil = this.daftarStok;

      if (this.fUpbjj) {
        hasil = hasil.filter((b) => b.upbjj === this.fUpbjj);
      }
      if (this.fUpbjj && this.fKategori) {
        hasil = hasil.filter((b) => b.kategori === this.fKategori);
      }
      if (this.fReorder) {
        hasil = hasil.filter((b) => b.qty === 0 || b.qty < b.safety);
      }
      if (this.sortBy) {
        hasil = [...hasil].sort((a, b) => {
          if (this.sortBy === "judul") return a.judul.localeCompare(b.judul);
          return a[this.sortBy] - b[this.sortBy];
        });
      }
      return hasil;
    },

    totalJudul() {
      return this.daftarStok.length;
    },

    totalQty() {
      return this.daftarStok.reduce((total, b) => total + b.qty, 0);
    },

    // berapa bahan ajar yang stoknya sudah di bawah safety atau habis
    jumlahReorder() {
      return this.daftarStok.filter((b) => b.qty === 0 || b.qty < b.safety).length;
    }
  },

  watch: {
    // kalau UT-Daerah diganti, kategori ikut di-reset biar kombinasi filternya masuk akal
    fUpbjj() {
      this.fKategori = "";
    },

    // qty negatif langsung ditolak pas diketik di form
    "formStok.qty"(nilaiBaru) {
      if (nilaiBaru < 0) {
        this.pesanStok = "Jumlah stok tidak boleh negatif. Nilai saya setel ke 0.";
        this.pesanSukses = false;
        this.formStok.qty = 0;
      }
    },

    // catat jam setiap daftar berubah (tambah / ubah / hapus)
    daftarStok: {
      handler() {
        this.waktuPembaruan = new Date().toLocaleTimeString("id-ID");
      },
      deep: true
    }
  },

  methods: {
    formatRupiah(angka) {
      return "Rp " + Number(angka || 0).toLocaleString("id-ID");
    },

    resetFilter() {
      this.fUpbjj = "";
      this.fKategori = "";
      this.fReorder = false;
      this.sortBy = "";
      this.pesanStok = "";
    },

    // isi form dengan data baris yang diklik ikon pensil
    editStok(kode) {
      const index = this.daftarStok.findIndex((b) => b.kode === kode);
      if (index === -1) return;

      this.editIndex = index;
      this.formStok = { ...this.daftarStok[index] };
      this.pesanStok = "Mengubah data: " + this.daftarStok[index].judul;
      this.pesanSukses = false;
      document.getElementById("formTambah").scrollIntoView({ behavior: "smooth" });
    },

    batalEdit() {
      this.resetForm();
      this.editIndex = -1;
      this.pesanStok = "";
    },

    simpanStok() {
      const f = this.formStok;
      f.kode = f.kode.toUpperCase(); // samakan dulu, biar pengecekan kembar akurat

      // validasi: kolom penting wajib diisi, angka tidak boleh negatif
      if (!f.kode || !f.judul || !f.kategori || !f.upbjj || !f.lokasiRak) {
        this.pesanStok = "Kode, judul, kategori, UT-Daerah, dan lokasi rak wajib diisi.";
        this.pesanSukses = false;
        return;
      }
      if (f.harga < 0 || f.safety < 0) {
        this.pesanStok = "Harga dan safety stock tidak boleh negatif.";
        this.pesanSukses = false;
        return;
      }

      if (this.editIndex === -1) {
        // mode tambah — kode mata kuliah tidak boleh kembar
        const sudahAda = this.daftarStok.some((b) => b.kode === f.kode);
        if (sudahAda) {
          this.pesanStok = "Kode mata kuliah " + f.kode + " sudah terdaftar.";
          this.pesanSukses = false;
          return;
        }
        this.daftarStok.unshift({ ...f });
        this.pesanStok = "Stok " + f.judul + " berhasil ditambahkan.";
      } else {
        // mode ubah — kode tidak ikut diganti karena kolomnya dikunci
        const b = this.daftarStok[this.editIndex];
        Object.assign(b, { ...f, kode: b.kode });
        this.pesanStok = "Data " + b.judul + " berhasil diperbarui.";
      }

      this.pesanSukses = true;
      this.resetForm();
      this.editIndex = -1;
    },

    hapusStok(kode) {
      // kalau baris yang dihapus kebetulan sedang diedit, batalkan dulu mode editnya
      if (this.editIndex > -1) this.batalEdit();
      this.daftarStok = this.daftarStok.filter((b) => b.kode !== kode);
    },

    resetForm() {
      this.formStok = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ""
      };
    }
  }
}).mount("#app-stok");
