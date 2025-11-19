// === CONFIG ===
const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

// DOM
const searchBtn = document.getElementById("searchBtn");
const queryInput = document.getElementById("queryInput");
const resultBox = document.getElementById("resultBox");
const themeToggle = document.getElementById("themeToggle");
const toggleText = document.querySelector(".toggle-text");
const toggleIcon = document.querySelector(".toggle-icon");
const skeletonBox = document.getElementById("skeletonBox");
const loader = document.getElementById("loader");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.checked = true;
    toggleText.textContent = "Mode Terang";
    toggleIcon.textContent = "☀️";
}

themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.body.classList.add("dark");
        toggleText.textContent = "Mode Terang";
        toggleIcon.textContent = "☀️";
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        toggleText.textContent = "Mode Gelap";
        toggleIcon.textContent = "🌙";
        localStorage.setItem("theme", "light");
    }
});
// Search
searchBtn.addEventListener("click", searchData);
queryInput.addEventListener("keypress", e => e.key === "Enter" && searchData());

// Clean
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

// Main search
function searchData() {
    const raw = queryInput.value.trim();
    if (!raw) return renderError("Masukkan nama atau angka.");

    showSkeleton();
    showLoader();

    const onlyDigits = cleanNumber(raw);
    const is4 = /^\d{4}$/.test(onlyDigits);
    const q = is4 ? onlyDigits : raw.toLowerCase();

    fetch(`${API_URL}?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
            hideSkeleton();
            hideLoader();

            if (!data || data.status === "error")
                return renderError(data?.pesan || "Tidak ditemukan.");

            // ==== PENYESUAIAN BARU ====
            // nomor_whatsapp → dinormalisasi
            // nomor_lapak → tetap
            const normalized = (data.hasil || []).map(item => ({
                nama: item.nama,
                nomor_whatsapp: normalizePhone(item.nomor_whatsapp || ""),
                nomor_lapak: item.nomor_lapak || "Tidak ada",
                baris: item.baris
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
            <div><strong>Nomor WhatsApp:</strong> ${escape(r.nomor_whatsapp)}</div>
            <div class="small"><strong>Nomor Lapak:</strong> ${escape(r.nomor_lapak)}</div>
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

function showSkeleton() {
    skeletonBox.classList.remove("hidden");
    resultBox.classList.add("hidden");
}

function hideSkeleton() {
    skeletonBox.classList.add("hidden");
}

function showLoader() {
    loader.classList.remove("hidden");
    resultBox.classList.add("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}
