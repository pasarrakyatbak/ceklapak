// === CONFIG ===
const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

// DOM
const searchBtn = document.getElementById("searchBtn");
const queryInput = document.getElementById("queryInput");
const resultBox = document.getElementById("resultBox");
const themeToggle = document.getElementById("themeToggle");

// Init theme
(function initTheme() {
    const saved = localStorage.getItem("umkm_theme");
    if (saved === "dark") document.body.classList.add("dark");
    themeToggle.checked = document.body.classList.contains("dark");
})();

themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("umkm_theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

// Search
searchBtn.addEventListener("click", searchData);
queryInput.addEventListener("keypress", e => e.key === "Enter" && searchData());

function cleanNumber(input) {
    return input.replace(/\s|\.|-|\(|\)|\+/g, "");
}

function normalizePhone(phone) {
    if (!phone) return "";
    const digits = phone.replace(/[^0-9]/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return digits;
    return "0" + digits;
}

function searchData() {
    const raw = queryInput.value.trim();
    if (!raw) return renderError("Masukkan nama atau angka.");

    const onlyDigits = cleanNumber(raw);
    const is4 = /^\d{4}$/.test(onlyDigits);
    const q = is4 ? onlyDigits : raw.toLowerCase();

    fetch(`${API_URL}?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.status === "error")
                return renderError(data?.message || "Tidak ditemukan.");

            const normalized = (data.hasil || []).map(item => ({
                ...item,
                nomor: normalizePhone(item.nomor || item.phone || "")
            }));

            renderResults(normalized);
        })
        .catch(() => renderError("Server tidak merespon."));
}

function renderResults(results) {
    resultBox.classList.remove("hidden");

    if (!results.length) {
        resultBox.innerHTML = `<p class="empty">Tidak ada hasil.</p>`;
        return;
    }

    let html = "";
    results.forEach(r => {
        html += `
        <div class="result-item">
            <div><strong>Nama:</strong> ${escape(r.nama)}</div>
            <div><strong>Nomor:</strong> ${escape(r.nomor)}</div>
            <div class="small"><strong>Jualan:</strong> ${escape(r.jualan || r.jenis_jualan)}</div>
        </div>
        `;
    });

    resultBox.innerHTML = html;
}

function renderError(msg) {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<p style="color:var(--primary);font-weight:600">${escape(msg)}</p>`;
}

function escape(s) {
    return String(s || "—")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
