document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.global-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            } else {
                navbar.style.backgroundColor = 'rgba(245, 245, 247, 0.8)';
            }
        });
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navLinks.classList.contains('active')) {
                menuToggle.textContent = '✕';
            } else {
                menuToggle.textContent = '☰';
            }
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.textContent = '☰';
        });
    });

    // --- Impact Calculator Logic ---
    const coasterRange = document.getElementById('coasterCount');
    const coasterNumber = document.getElementById('coasterCountNumber');
    
    const resCoffee = document.getElementById('resCoffee');
    const resPlastic = document.getElementById('resPlastic');
    const resCarbon = document.getElementById('resCarbon');

    // Constants per unit
    const COFFEE_GRAMS = 70;
    const PLASTIC_GRAMS = 80;
    const CARBON_KG = 0.596;

    function formatNumber(num) {
        // Format to Indonesian locale if needed, but for simple g/kg we can just append unit.
        // For values >= 1000g, convert to kg
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'kg';
        }
        return num + 'g';
    }

    function updateCalculator(val) {
        const count = parseInt(val);
        
        // Sync inputs
        coasterRange.value = count;
        coasterNumber.value = count;

        // Calculate
        const coffeeTotal = count * COFFEE_GRAMS;
        const plasticTotal = count * PLASTIC_GRAMS;
        const carbonTotal = (count * CARBON_KG).toFixed(1);

        // Update DOM
        resCoffee.textContent = formatNumber(coffeeTotal);
        resPlastic.textContent = formatNumber(plasticTotal);
        resCarbon.textContent = carbonTotal + 'kg';
    }

    // Event Listeners for Calculator
    coasterRange.addEventListener('input', (e) => {
        updateCalculator(e.target.value);
    });

    coasterNumber.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val < 1) val = 1;
        if (val > 500) val = 500;
        updateCalculator(val);
    });
    
    // Initialize
    updateCalculator(1);

    // --- B2B Form Submission Mock ---
    const b2bForm = document.getElementById('b2bForm');
    if (b2bForm) {
        b2bForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const company = document.getElementById('companyName').value;
            alert(`Terima kasih ${company}! Permintaan penawaran Anda telah kami terima. Tim COPLA akan segera menghubungi Anda.`);
            b2bForm.reset();
        });
    }
});
