// === CONFIG ===
// === EVENT ===
document.getElementById("searchBtn").addEventListener("click", searchData);
document.getElementById("queryInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchData();
});

// === VALIDASI NOMOR: hapus spasi, titik, tanda hubung ===
function cleanNumber(input) {
    return input.replace(/\s|\.|-/g, "");
}

// === SEARCH FUNCTION ===
function searchData() {
    const input = document.getElementById("queryInput").value.trim();
    let query = cleanNumber(input);

    if (query === "") {
        renderError("Masukkan nama atau 4 digit nomor HP.");
        return;
    }

    fetch(`${API_URL}?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "error") {
                renderError(data.pesan);
            } else {
                renderResults(data.hasil);
            }
        })
        .catch(() => {
            renderError("Gagal menghubungi server. Periksa koneksi internet Anda.");
        });
}

// === RENDER HASIL ===
function renderResults(results) {
    const box = document.getElementById("resultBox");
    box.classList.remove("hidden");

    if (!results || results.length === 0) {
        box.innerHTML = "<p>Tidak ada hasil ditemukan.</p>";
        return;
    }

    let html = "";

    results.forEach(r => {
        html += `
      <div class="result-item">
        <strong>Nama:</strong> ${r.nama}<br>
        <strong>Nomor HP:</strong> ${r.nomor}<br>
        <strong>Jualan:</strong> ${r.jenis_jualan}<br>
        <small>Baris data: ${r.baris}</small>
      </div>
    `;
    });

    box.innerHTML = html;
}

// === TAMPILKAN ERROR ===
function renderError(msg) {
    const box = document.getElementById("resultBox");
    box.classList.remove("hidden");
    box.innerHTML = `<p style="color:red;">${msg}</p>`;
}

