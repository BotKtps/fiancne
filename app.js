// Menunggu DOM (halaman) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {

    // 1. Ambil Elemen DOM
    const txForm = document.getElementById('tx-form');
    const budgetForm = document.getElementById('budget-form');
    const txList = document.getElementById('tx-list');
    const canvas = document.getElementById('financeChart').getContext('2d');

    // Elemen Dashboard
    const totalPemasukanEl = document.getElementById('total-pemasukan');
    const totalPengeluaranEl = document.getElementById('total-pengeluaran');
    const saldoAkhirEl = document.getElementById('saldo-akhir');
    const sisaAnggaranEl = document.getElementById('sisa-anggaran');

    // 2. State Aplikasi (Data disimpan di sini)
    // Dalam aplikasi nyata, ini akan datang dari database
    let transactions = [];
    let budgetBulanan = 0;

    // Helper function untuk format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    // 3. Inisialisasi Grafik (Chart.js)
    // Ini adalah fitur "Grafik Keuangan Intuitif"
    const myChart = new Chart(canvas, {
        type: 'doughnut', // Tipe grafik (bisa 'bar', 'line', dll)
        data: {
            labels: ['Pemasukan', 'Pengeluaran'],
            datasets: [{
                label: 'Ringkasan Keuangan',
                data: [0, 0], // Data awal [Pemasukan, Pengeluaran]
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',  // Hijau
                    'rgba(220, 53, 69, 0.8)'   // Merah
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Ringkasan Pemasukan vs Pengeluaran'
                }
            }
        }
    });

    // 4. Fungsi Utama: Update UI (Dashboard, Laporan, Grafik)
    // Ini adalah fitur "Laporan Realtime" (realtime di sisi klien)
    const updateUI = () => {
        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        // Kosongkan list riwayat
        txList.innerHTML = '';

        // Loop data transaksi untuk menghitung total dan menampilkan riwayat
        transactions.forEach(tx => {
            const li = document.createElement('li');
            
            // Format dompet (kapitalisasi huruf pertama)
            const dompetText = tx.dompet.charAt(0).toUpperCase() + tx.dompet.slice(1);
            
            li.innerHTML = `
                <div class="deskripsi">
                    ${tx.deskripsi}
                    <span>${new Date(tx.id).toLocaleString('id-ID')} | ${dompetText}</span>
                </div>
                <span class="jumlah ${tx.tipe}">
                    ${tx.tipe === 'pemasukan' ? '+' : '-'} ${formatRupiah(tx.jumlah)}
                </span>
            `;
            
            // Tambahkan ke list (transaksi terbaru di atas)
            txList.prepend(li);

            // Akumulasi total
            if (tx.tipe === 'pemasukan') {
                totalPemasukan += tx.jumlah;
            } else {
                totalPengeluaran += tx.jumlah;
            }
        });

        const saldoAkhir = totalPemasukan - totalPengeluaran;
        const sisaAnggaran = budgetBulanan - totalPengeluaran;

        // Update Tampilan Dashboard
        totalPemasukanEl.textContent = formatRupiah(totalPemasukan);
        totalPengeluaranEl.textContent = formatRupiah(totalPengeluaran);
        saldoAkhirEl.textContent = formatRupiah(saldoAkhir);
        sisaAnggaranEl.textContent = formatRupiah(sisaAnggaran);

        // Update Data Grafik
        myChart.data.datasets[0].data[0] = totalPemasukan;
        myChart.data.datasets[0].data[1] = totalPengeluaran;
        myChart.update();
    };

    // 5. Event Listener untuk Form Transaksi
    // Ini adalah fitur "Catatan Pendapatan dan Pengeluaran"
    txForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah form submit (reload halaman)

        // Ambil nilai dari form
        const deskripsi = document.getElementById('tx-deskripsi').value;
        const jumlah = parseInt(document.getElementById('tx-jumlah').value);
        const tipe = document.getElementById('tx-tipe').value;
        const dompet = document.getElementById('tx-dompet').value; // Fitur "Kelola Dompet" (simulasi)

        if (deskripsi.trim() === '' || isNaN(jumlah) || jumlah <= 0) {
            alert('Silakan isi deskripsi dan jumlah yang valid.');
            return;
        }

        // Buat objek transaksi baru
        const transaction = {
            id: Date.now(), // ID unik sederhana
            deskripsi: deskripsi,
            jumlah: jumlah,
            tipe: tipe,
            dompet: dompet
        };

        // Tambahkan ke array state
        transactions.push(transaction);

        // Update UI
        updateUI();

        // Reset form
        txForm.reset();
        document.getElementById('tx-deskripsi').focus();
    });

    // 6. Event Listener untuk Form Anggaran
    // Ini adalah fitur "Mengelola Anggaran Bulanan"
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const budgetInput = parseInt(document.getElementById('budget-bulanan').value);

        if (isNaN(budgetInput) || budgetInput < 0) {
            alert('Masukkan jumlah anggaran yang valid.');
            return;
        }

        budgetBulanan = budgetInput;
        
        // Update UI (terutama Sisa Anggaran)
        updateUI();
        
        alert(`Anggaran bulanan diatur ke ${formatRupiah(budgetBulanan)}`);
    });

    // Panggil updateUI() saat pertama kali dimuat
    updateUI();
});