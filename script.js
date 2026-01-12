// FUNGSI 1: Untuk memuat daftar negara saat pertama kali dibuka
async function ambilData() {
    const kontainer = document.getElementById('hasil-api');
    kontainer.innerHTML = "<p>Sedang memuat...</p>";
    if (respon.ok) {
        const suhu = Math.round(data.main.temp);
        const deskripsi = data.weather[0].description;
        const icon = data.weather[0].icon; // Ambil kode icon (misal: 01d)

        // Kita tampilkan suhu beserta gambarnya
        el.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${icon}.png" style="width:30px; vertical-align:middle;">
        ${suhu}°C, ${deskripsi}
    `;
    }
    try {
        const respon = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population');
        if (!respon.ok) throw new Error("Gagal mengambil data");

        const data = await respon.json();
        tampilkanData(data.slice(0, 12)); // Tampilkan 12 saja
    } catch (error) {
        kontainer.innerHTML = `<p style="color:red">${error.message}</p>`;
    }
}

// FUNGSI 2: Untuk mencari negara berdasarkan input
async function cariNegara() {
    const input = document.getElementById('input-cari').value;
    const kontainer = document.getElementById('hasil-api');
    const spinner = document.getElementById('loading-spinner');

    if (!input) {
        alert("Masukkan nama negara!");
        return;
    }

    // 1. Tampilkan spinner & bersihkan layar
    spinner.style.display = "block";
    kontainer.innerHTML = "";

    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${input}`);
        if (!res.ok) throw new Error("Negara tidak ditemukan");

        const data = await res.json();

        // 2. Kirim data ke fungsi tampilkan
        await tampilkanData(data);

    } catch (e) {
        kontainer.innerHTML = `<p style="color:red">${e.message}</p>`;
    } finally {
        // 3. Sembunyikan spinner setelah selesai (berhasil maupun gagal)
        spinner.style.display = "none";
    }
}

// GANTI DENGAN API KEY YANG SUDAH AKTIF
const WEATHER_API_KEY = "PASTE_API_KEY_DI_SINI";

async function tampilkanData(daftarNegara) {
    const kontainer = document.getElementById('hasil-api');

    // 1. Bersihkan layar agar tidak ganda
    kontainer.innerHTML = "";

    // 2. Buat semua kartu negara dulu
    daftarNegara.forEach(negara => {
        const ibuKota = negara.capital ? negara.capital[0] : null;
        // Gunakan ID unik berdasarkan kode negara (cca3) agar tidak tertukar
        const idElemenCuaca = `weather-${negara.cca3}`;

        const kartuHTML = `
            <div class="card">
                <img src="${negara.flags.png}" alt="Flag">
                <div class="card-info">
                    <h3>${negara.name.common}</h3>
                    <p><strong>Ibu Kota:</strong> ${ibuKota || '-'}</p>
                    <p><strong>🌡️ Cuaca:</strong> <span id="${idElemenCuaca}">Memuat...</span></p>
                    <p><strong>👥 Populasi:</strong> ${negara.population.toLocaleString('id-ID')}</p>
                </div>
            </div>
        `;
        kontainer.insertAdjacentHTML('beforeend', kartuHTML);

        // 3. Setelah kartu masuk ke HTML, baru kita panggil cuacanya
        if (ibuKota) {
            ambilCuaca(ibuKota, idElemenCuaca);
        } else {
            const el = document.getElementById(idElemenCuaca);
            if (el) el.innerText = "N/A";
        }
    });
}

async function ambilCuaca(kota, idElemen) {
    try {
        const respon = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${kota}&appid=${WEATHER_API_KEY}&units=metric&lang=id`
        );
        const data = await respon.json();

        const el = document.getElementById(idElemen);
        if (!el) return; // Keamanan jika elemen hilang

        if (respon.ok) {
            el.innerText = `${Math.round(data.main.temp)}°C, ${data.weather[0].description}`;
        } else {
            // Jika error 401 (Invalid Key), tampilkan pesan yang jelas
            console.warn(`Masalah cuaca di ${kota}: ${data.message}`);
            el.innerText = "Kunci API belum aktif";
        }
    } catch (error) {
        const el = document.getElementById(idElemen);
        if (el) el.innerText = "Gagal memuat";
    }
}

// Fungsi Cari tetap sama
async function cariNegara() {
    const input = document.getElementById('input-cari').value;
    if (!input) return;

    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${input}`);
        if (!res.ok) throw new Error("Negara tidak ditemukan");
        const data = await res.json();
        tampilkanData(data);
    } catch (e) {
        alert(e.message);
    }
}
// Tunggu sampai seluruh halaman selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
    const inputCari = document.getElementById("input-cari");

    // Pastikan elemen input-cari memang ada di HTML
    if (inputCari) {
        inputCari.addEventListener("keypress", function (event) {
            // Cek apakah tombol yang ditekan adalah Enter
            if (event.key === "Enter") {
                event.preventDefault(); // Mencegah form melakukan refresh otomatis
                cariNegara(); // Panggil fungsi cari
            }
        });
    }
});