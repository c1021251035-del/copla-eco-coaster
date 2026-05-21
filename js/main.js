document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:3000/api';

    const navbar = document.querySelector('.global-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.backgroundColor = window.scrollY > 50
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(245, 245, 247, 0.8)';
        });
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '\u2715' : '\u2630';
        });
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.textContent = '\u2630';
        });
    });

    const coasterRange = document.getElementById('coasterCount');
    const coasterNumber = document.getElementById('coasterCountNumber');
    const resCoffee = document.getElementById('resCoffee');
    const resPlastic = document.getElementById('resPlastic');
    const resCarbon = document.getElementById('resCarbon');

    if (coasterRange && coasterNumber) {
        const COFFEE_GRAMS = 70;
        const PLASTIC_GRAMS = 80;
        const CARBON_KG = 0.596;
        let calcTimeout;

        function formatNumber(num) {
            if (num >= 1000) return (num / 1000).toFixed(2) + 'kg';
            return num + 'g';
        }

        function updateCalculator(val) {
            const count = parseInt(val) || 1;
            coasterRange.value = count;
            coasterNumber.value = count;
            resCoffee.textContent = formatNumber(count * COFFEE_GRAMS);
            resPlastic.textContent = formatNumber(count * PLASTIC_GRAMS);
            resCarbon.textContent = (count * CARBON_KG).toFixed(1) + 'kg';

            clearTimeout(calcTimeout);
            calcTimeout = setTimeout(() => {
                fetch(`${API_BASE}/impact/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ count, sessionId: 'anonymous' })
                }).catch(() => {});
            }, 1000);
        }

        coasterRange.addEventListener('input', (e) => updateCalculator(e.target.value));
        coasterNumber.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 1;
            if (val < 1) val = 1;
            if (val > 500) val = 500;
            updateCalculator(val);
        });
        updateCalculator(1);
    }

    const b2bForm = document.getElementById('b2bForm');
    if (b2bForm) {
        b2bForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                companyName: document.getElementById('companyName').value,
                contactName: document.getElementById('contactName').value,
                waNumber: document.getElementById('waNumber').value,
                orderQty: document.getElementById('orderQty').value,
                customReq: document.getElementById('customReq').value
            };

            const btn = b2bForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Mengirim...';

            try {
                const res = await fetch(`${API_BASE}/b2b/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.success) {
                    alert(data.message);
                    b2bForm.reset();
                } else {
                    alert('Error: ' + (data.error || 'Gagal mengirim'));
                }
            } catch (err) {
                alert('Gagal terhubung ke server. Pastikan backend sudah berjalan.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Kirim Permintaan';
            }
        });
    }

    const partnerForm = document.getElementById('partnerForm');
    if (partnerForm) {
        partnerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                cafeName: document.getElementById('cafeName').value,
                ownerName: document.getElementById('ownerName').value,
                waNumber: document.getElementById('waNumber').value,
                address: document.getElementById('address').value
            };

            const btn = partnerForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Mengirim...';

            try {
                const res = await fetch(`${API_BASE}/partnership/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.success) {
                    alert(data.message);
                    partnerForm.reset();
                } else {
                    alert('Error: ' + (data.error || 'Gagal mengirim'));
                }
            } catch (err) {
                alert('Gagal terhubung ke server. Pastikan backend sudah berjalan.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Daftar Sekarang';
            }
        });
    }
});
