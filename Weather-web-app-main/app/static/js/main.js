document.addEventListener('DOMContentLoaded', () => {
    // Live clock
    const clock = document.getElementById('clock');
    const updateClock = () => {
        if (!clock) return;
        const now = new Date();
        const opts = {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        clock.textContent = now.toLocaleDateString('en-US', opts);
    };
    updateClock();
    setInterval(updateClock, 1000);

    document.querySelectorAll('[data-card-date]').forEach(el => {
        const now = new Date();
        el.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    });

    // Forecast page
    const chartCanvas = document.getElementById('forecastChart');
    const forecastBody = document.getElementById('forecastTableBody');
    const rangeButtons = document.querySelectorAll('.js-range-btn');

    let chartInstance = null;

    function renderForecast(range) {
        const dataset = (window.WEATHER_FORECAST_DATA && window.WEATHER_FORECAST_DATA[range]) || [];
        if (!forecastBody) return;

        forecastBody.innerHTML = dataset.map(item => `
            <tr>
                <td class="fw-semibold">${item.label}</td>
                <td>${item.temp}°C</td>
                <td>${item.condition}</td>
                <td>${item.rain}</td>
                <td>${item.wind}</td>
            </tr>
        `).join('');

        if (chartCanvas && window.Chart) {
            const labels = dataset.map(item => item.label);
            const temps = dataset.map(item => item.temp);

            if (chartInstance) chartInstance.destroy();
            chartInstance = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temps,
                        tension: 0.35,
                        borderWidth: 3,
                        pointRadius: 4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: '#fff' } } },
                    scales: {
                        x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,.08)' } },
                        y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,.08)' } }
                    }
                }
            });
        }
    }

    if (rangeButtons.length) {
        rangeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                rangeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderForecast(btn.dataset.range);
            });
        });
        renderForecast('hourly');
    }

    // Favorites page
    const favoriteForm = document.getElementById('favoriteForm');
    const favoriteInput = document.getElementById('favoriteInput');
    const favoriteList = document.getElementById('favoriteList');
    const favoriteWeatherGrid = document.getElementById('favoriteWeatherGrid');

    const initialFavorites = ['Porbandar', 'Ahmedabad', 'Mumbai'];

    function renderFavorites() {
        if (favoriteList) {
            favoriteList.innerHTML = initialFavorites.map(city => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fa-solid fa-location-dot text-warning me-2"></i>${city}</span>
                    <button class="btn btn-sm btn-outline-light remove-fav" data-city="${city}">Remove</button>
                </li>
            `).join('');
        }

        if (favoriteWeatherGrid) {
            favoriteWeatherGrid.innerHTML = initialFavorites.map((city, idx) => `
                <div class="col-12 col-md-6">
                    <div class="glass-card p-3 h-100">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="fw-bold fs-5">${city}</div>
                                <div class="text-white-50 small">Sunny · Updated 5 min ago</div>
                            </div>
                            <div class="fs-3 fw-bold">${28 + idx}°C</div>
                        </div>
                        <div class="d-flex gap-3 mt-3 text-white-50 small">
                            <span><i class="fa-solid fa-droplet text-warning me-1"></i>${58 + idx}%</span>
                            <span><i class="fa-solid fa-wind text-warning me-1"></i>${9 + idx} km/h</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    if (favoriteForm) {
        favoriteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = favoriteInput.value.trim();
            if (!city) return;
            if (!initialFavorites.includes(city)) initialFavorites.unshift(city);
            favoriteInput.value = '';
            renderFavorites();
        });

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-fav');
            if (!btn) return;
            const city = btn.dataset.city;
            const idx = initialFavorites.indexOf(city);
            if (idx >= 0) initialFavorites.splice(idx, 1);
            renderFavorites();
        });
    }
    renderFavorites();

    // Compare page
    const compareBody = document.getElementById('compareTableBody');
    const addCompareRowBtn = document.getElementById('addCompareRowBtn');
    const compareRows = [
        ['Porbandar', 29, 61, 1008, '12 km/h', 32],
        ['Mumbai', 30, 74, 1004, '16 km/h', 34],
        ['Delhi', 27, 42, 1012, '9 km/h', 29]
    ];

    function renderCompare() {
        if (!compareBody) return;
        compareBody.innerHTML = compareRows.map(row => `
            <tr>
                <td class="fw-semibold">${row[0]}</td>
                <td>${row[1]}°C</td>
                <td>${row[2]}%</td>
                <td>${row[3]} hPa</td>
                <td>${row[4]}</td>
                <td>${row[5]}°C</td>
            </tr>
        `).join('');
    }
    if (addCompareRowBtn) {
        addCompareRowBtn.addEventListener('click', () => {
            const city = prompt('Enter city name:');
            if (!city) return;
            compareRows.push([city, 28, 60, 1008, '10 km/h', 31]);
            renderCompare();
        });
    }
    renderCompare();

    // Map page
    const nearbyCities = document.getElementById('nearbyCities');
    if (nearbyCities) {
        nearbyCities.innerHTML = ['Porbandar', 'Rajkot', 'Jamnagar', 'Bhuj'].map((city, idx) => `
            <div class="glass-card p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">${city}</div>
                        <div class="text-white-50 small">Clear skies</div>
                    </div>
                    <div class="fw-bold">${28 + idx}°C</div>
                </div>
            </div>
        `).join('');
    }

    // Alerts page
    const alertGrid = document.getElementById('alertGrid');
    const enableAlertsBtn = document.getElementById('enableAlertsBtn');
    const alertItems = [
        { title: 'Rain Alert', text: 'Light rain expected from 4 PM to 6 PM.', icon: 'fa-cloud-rain', status: 'Active' },
        { title: 'Heat Alert', text: 'High temperature expected tomorrow afternoon.', icon: 'fa-sun', status: 'Watch' },
        { title: 'Wind Alert', text: 'Wind speed may rise above 20 km/h tonight.', icon: 'fa-wind', status: 'Notice' }
    ];

    if (alertGrid) {
        alertGrid.innerHTML = alertItems.map(item => `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="glass-card p-4 h-100">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="empty-icon" style="width:64px;height:64px;font-size:1.3rem;">
                            <i class="fa-solid ${item.icon}"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${item.title}</div>
                            <div class="text-warning small">${item.status}</div>
                        </div>
                    </div>
                    <p class="text-white-50 mb-0">${item.text}</p>
                </div>
            </div>
        `).join('');
    }
    if (enableAlertsBtn) {
        enableAlertsBtn.addEventListener('click', () => alert('Browser alerts enabled placeholder. Connect Notification API here.'));
    }

    // Settings page
    const settingsForm = document.getElementById('settingsForm');
    const settingsPreview = document.getElementById('settingsPreview');
    const unitSelect = document.getElementById('unitSelect');
    const themeSelect = document.getElementById('themeSelect');
    const defaultCityInput = document.getElementById('defaultCityInput');

    const saved = JSON.parse(localStorage.getItem('weather_settings') || '{}');
    if (unitSelect && saved.unit) unitSelect.value = saved.unit;
    if (themeSelect && saved.theme) themeSelect.value = saved.theme;
    if (defaultCityInput && saved.defaultCity) defaultCityInput.value = saved.defaultCity;

    function renderSettingsPreview() {
        if (!settingsPreview) return;
        settingsPreview.innerHTML = `
            <li>Unit: <strong>${unitSelect?.value || 'celsius'}</strong></li>
            <li>Theme: <strong>${themeSelect?.value || 'dark'}</strong></li>
            <li>Default city: <strong>${defaultCityInput?.value || 'Porbandar'}</strong></li>
        `;
    }
    renderSettingsPreview();

    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                unit: unitSelect?.value || 'celsius',
                theme: themeSelect?.value || 'dark',
                defaultCity: defaultCityInput?.value || 'Porbandar'
            };
            localStorage.setItem('weather_settings', JSON.stringify(data));
            renderSettingsPreview();
            alert('Settings saved.');
        });

        [unitSelect, themeSelect, defaultCityInput].forEach(el => {
            if (!el) return;
            el.addEventListener('input', renderSettingsPreview);
            el.addEventListener('change', renderSettingsPreview);
        });
    }
});
