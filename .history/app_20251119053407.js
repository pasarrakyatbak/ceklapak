// === CONFIG ===
const API_URL = "YOUR_DEPLOYED_WEB_APP_URL_HERE"; // Ganti setelah deploy Apps Script

// DOM
const searchBtn = document.getElementById("searchBtn");
const queryInput = document.getElementById("queryInput");
const resultBox = document.getElementById("resultBox");
const themeToggle = document.getElementById("themeToggle");

// Inisialisasi tema dari localStorage
(function initTheme() {
  const saved = localStorage.getItem("umkm_theme");
  if (saved === "dark") document.body.classList.add("dark");
  themeToggle.checked = document.body.classList.contains("dark");
})();

// Event listeners
searchBtn.addEventListener("click", searchData);
queryInput.addEventListener("keypress", (e) => { if (e.key === "Enter") searchData(); });
themeToggle.addEventListener("change", toggleTheme);

// === Utilities ===
function cleanNumber(input) {
  // hapus spasi, titik, tanda hubung, kurung, plus
  return input.replace(/\s|\.|-|\(|\)|\+/g, "");
}

function normalizePhone(phone) {
  if (!phone) return "";
  phone = phone.toString().trim();
  phone = cleanNumber(phone);
  // ambil hanya angka
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return digits;
  return "0" + digits;
}

function toggleTheme() {
  const isDark = themeToggle.checked;
  if (isDark) document.body.classList.add("dark"); else document.body.classList.remove("dark");
  localStorage.setItem("umkm_theme", isDark ? "dark" : "light");
}

// === Search ===
function searchData() {
  const raw = queryInput.value.trim();
  if (!raw) return renderError("Masukkan nama atau 4 digit nomor HP.");

  // Jika input berisi huruf -> treat as name, else numeric -> treat as digits
  let q = raw;
  const onlyDigits = cleanNumber(q);

  // jika numeric dan panjang 4 maka dianggap 4-digit search
  let isLast4 = /^\d{4}$/.test(onlyDigits);
  if (isLast4) q = onlyDigits;
  else q = raw.toLowerCase();

  // panggil API
  fetch(`${API_URL}?q=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(data => {
      if (!data) return renderError("Data tidak valid dari server.");
      if (data.status === "error") return renderError(data.pesan || data.message || "Tidak ditemukan.");

      // normalize nomor pada hasil
      const normalized = (data.hasil || data.hasil || data.data || []).map(item => ({
        ...item,
        nomor: normalizePhone(item.nomor || item.phone || "")
      }));

      renderResults(normalized);
    })
    .catch(err => {
      console.error(err);
      renderError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    });
}

// === RENDER ===
function renderResults(results) {
  resultBox.classList.remove("hidden");
  if (!results || results.length === 0) {
    resultBox.innerHTML = "<p>Tidak ada hasil ditemukan.</p>";
    return;
  }

  let html = "";
  results.forEach(r => {
    html += `
      <div class="result-item">
        <div><strong>Nama:</strong> ${escapeHtml(r.nama || '—')}</div>
        <div><strong>Nomor HP:</strong> ${escapeHtml(r.nomor || '—')}</div>
        <div class="small"><strong>Jualan:</strong> ${escapeHtml(r.jenis_jualan || r.jualan || '—')}</div>
        <div class="small">Baris data: ${escapeHtml(String(r.baris || '—'))}</div>
      </div>
    `;
  });
  resultBox.innerHTML = html;
}

function renderError(msg) {
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `<p style="color:var(--primary);font-weight:600">${escapeHtml(msg)}</p>`;
}

// safe escape
function escapeHtml(s){ return String(s)
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;'); }
