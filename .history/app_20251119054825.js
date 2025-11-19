const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";
hideLoading();
fetch(`${API_URL}?q=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(data => {
        if (!data || data.status === "error") {
            return renderError(data?.pesan || "Tidak ditemukan.");
        }

        const results = (data.hasil || data.data || []).map(item => ({
            ...item,
            nomor: normalizePhone(item.nomor || item.phone || "")
        }));

        renderResults(results);
    })
    .catch(() => {
        renderError("Gagal menghubungi server.");
    });

function renderResults(results) {
resultBox.classList.remove("hidden");


if (!results.length)
return (resultBox.innerHTML = `<p>Tidak ada hasil ditemukan.</p>`);


const html = results
.map(r => `
<div class="result-item">
<div><strong>Nama:</strong> $${escapeHtml(r.nama || '—')}</div>
<div><strong>Nomor HP:</strong> $${escapeHtml(r.nomor || '—')}</div>
<div class="small"><strong>Jualan:</strong> $${escapeHtml(r.jenis_jualan || r.jualan || '—')}</div>
<div class="small">Baris data: $${escapeHtml(r.baris || '—')}</div>
</div>
`).join('');


resultBox.innerHTML = html;
}


function renderError(msg) {
resultBox.classList.remove("hidden");
resultBox.innerHTML = `<p style="color:var(--primary);font-weight:600">$${escapeHtml(msg)}</p>`;
}


function escapeHtml(s) {
return String(s)
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#39;');
}