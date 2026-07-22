// ==========================================
// SCRIPT.JS - UPCADEMI (VERSI RAPI)
// ==========================================

// ===== TOGGLE MENU MOBILE =====
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Tutup menu saat klik di luar
document.addEventListener('click', function(event) {
    const menu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
    if (menu && hamburger && !menu.contains(event.target) && !hamburger.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== VALIDASI FORM =====
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#D32F2F';
            isValid = false;
        } else {
            input.style.borderColor = '#2E7D32';
        }
    });

    return isValid;
}

// ===== FORMAT RUPIAH =====
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// ===== TIMER TRYOUT (110 Menit) =====
function startTimer(duration, displayId) {
    let timer = duration;
    const display = document.getElementById(displayId);

    const interval = setInterval(() => {
        const hours = Math.floor(timer / 3600);
        const minutes = Math.floor((timer % 3600) / 60);
        const seconds = timer % 60;

        display.textContent = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        if (--timer < 0) {
            clearInterval(interval);
            alert('Waktu habis! Tryout akan dikumpulkan otomatis.');
            document.getElementById('examForm')?.submit();
        }
    }, 1000);
}

// ===== NAVIGASI SOAL (CAT Style) =====
function navigateToQuestion(index) {
    const questions = document.querySelectorAll('.question-item');
    const panels = document.querySelectorAll('.question-panel');

    questions.forEach(q => q.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    if (questions[index]) {
        questions[index].classList.add('active');
        panels[index].classList.add('active');
    }
}

// ===== TANDAI SOAL RAGU-RAGU =====
function toggleRagu(button) {
    const questionId = button.dataset.questionId;
    const statusSpan = document.getElementById('status-' + questionId);

    if (statusSpan.textContent === 'Ragu-ragu') {
        statusSpan.textContent = 'Belum Dijawab';
        button.style.backgroundColor = '#546E7A';
    } else {
        statusSpan.textContent = 'Ragu-ragu';
        button.style.backgroundColor = '#FF9800';
    }
}

// ===== UPLOAD BUKTI TRANSFER =====
function previewBukti(input) {
    const preview = document.getElementById('preview-bukti');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Bukti Transfer" style="max-width: 200px; border-radius: 8px; margin-top: 10px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================
// ===== FITUR KOMENTAR/TESTIMONI =====
// ==========================================

// Ambil data komentar dari localStorage
function getKomentar() {
    const data = localStorage.getItem('komentarUpcademi');
    return data ? JSON.parse(data) : [];
}

// Simpan komentar ke localStorage
function saveKomentar(komentar) {
    localStorage.setItem('komentarUpcademi', JSON.stringify(komentar));
}

// Tampilkan semua komentar
function renderKomentar() {
    const container = document.getElementById('daftarKomentar');
    if (!container) return;

    const komentar = getKomentar();

    if (komentar.length === 0) {
        container.innerHTML = `
            <div class="komentar-empty">
                <div class="icon">💬</div>
                <p>Belum ada testimoni. Jadilah yang pertama!</p>
            </div>
        `;
        return;
    }

    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const sorted = [...komentar].reverse();

    container.innerHTML = sorted.map((item, index) => {
        const realIndex = komentar.length - 1 - index;
        return `
            <div class="komentar-item">
                <div class="komentar-header">
                    <span class="komentar-nama">${escapeHTML(item.nama)}</span>
                    <span class="komentar-badge">✅ Terverifikasi</span>
                    <span class="komentar-tanggal">${item.tanggal}</span>
                </div>
                <div class="komentar-teks">${escapeHTML(item.teks)}</div>
                ${isAdmin ? `
                    <div style="margin-top:10px; text-align:right;">
                        <button onclick="hapusKomentar(${realIndex})" 
                                style="padding:4px 16px; background:var(--red); color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">
                            🗑️ Hapus
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Hapus komentar
function hapusKomentar(index) {
    if (!confirm('Yakin ingin menghapus komentar ini?')) return;
    const komentar = getKomentar();
    komentar.splice(index, 1);
    saveKomentar(komentar);
    renderKomentar();
}

// Submit komentar
function submitKomentar(e) {
    e.preventDefault();

    const nama = document.getElementById('komentarNama');
    const teks = document.getElementById('komentarText');
    const alert = document.getElementById('komentarAlert');

    alert.style.display = 'none';
    alert.className = '';

    if (!nama.value.trim() || !teks.value.trim()) {
        alert.textContent = '⚠️ Semua field wajib diisi!';
        alert.style.display = 'block';
        alert.style.background = '#FFEBEE';
        alert.style.color = '#B71C1C';
        return false;
    }

    const komentar = getKomentar();
    komentar.push({
        nama: nama.value.trim(),
        teks: teks.value.trim(),
        tanggal: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    });
    saveKomentar(komentar);

    alert.textContent = '✅ Testimoni berhasil dikirim! Terima kasih atas ulasannya.';
    alert.style.display = 'block';
    alert.style.background = '#E8F5E9';
    alert.style.color = '#2E7D32';

    nama.value = '';
    teks.value = '';
    renderKomentar();

    return false;
}

// Escape HTML untuk keamanan
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==========================================
// ===== CEK LOGIN UNTUK KOMENTAR =====
// ==========================================

function isUserLoggedIn() {
    const email = localStorage.getItem('userEmail');
    return email && email !== '';
}

function getNamaUser() {
    return localStorage.getItem('userName') || 'User';
}

function cekLoginKomentar() {
    const loginWarning = document.getElementById('komentarLoginWarning');
    const formIsi = document.getElementById('komentarFormIsi');
    const inputNama = document.getElementById('komentarNama');
    
    if (isUserLoggedIn()) {
        if (loginWarning) loginWarning.style.display = 'none';
        if (formIsi) formIsi.style.display = 'block';
        if (inputNama) {
            inputNama.value = getNamaUser();
            inputNama.readOnly = true;
            inputNama.style.background = '#f5f5f5';
        }
    } else {
        if (loginWarning) loginWarning.style.display = 'block';
        if (formIsi) formIsi.style.display = 'none';
    }
}

// ==========================================
// ===== JALANKAN SAAT HALAMAN LOAD =====
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    cekLoginKomentar();
    renderKomentar();
});

console.log('✅ script.js berhasil dimuat!');