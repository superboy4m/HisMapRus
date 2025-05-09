
document.addEventListener('DOMContentLoaded', () => {
    // --- Cached DOM Elements ---
    const dom = {
        sectionBtns: document.querySelectorAll('.section-btn'),
        sections: document.querySelectorAll('.section'),
        authBtns: document.querySelector('.auth-btns'),
        logoutBtn: document.getElementById('logout-btn'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginMsg: document.getElementById('login-msg'),
        registerMsg: document.getElementById('register-msg'),
        userGreeting: document.getElementById('user-greeting'),
        openLoginBtn: document.getElementById('open-login'),
        openRegisterBtn: document.getElementById('open-register'),
        loginContainer: document.getElementById('login-form'),
        registerContainer: document.getElementById('register-form'),
        feedbackFormContainer: document.getElementById('feedback-form-container'),
        feedbackForm: document.getElementById('feedback-form'),
        feedbackText: document.getElementById('feedback-text'),
        feedbackDisplay: document.getElementById('feedback-display'),
        openAboutBtn: document.getElementById('open-about'),
        openInternalEventsBtn: document.getElementById('open-internal-events'),
        openExternalEventsBtn: document.getElementById('open-external-events'),
        openWorldEventsBtn: document.getElementById('open-world-events'),
        aboutModal: document.getElementById('about-modal'),
        internalEventsModal: document.getElementById('internal-events-modal'),
        externalEventsModal: document.getElementById('external-events-modal'),
        worldEventsModal: document.getElementById('world-events-modal'),
        closeAboutBtn: document.getElementById('close-about'),
        closeInternalEventsBtn: document.getElementById('close-internal-events'),
        closeExternalEventsBtn: document.getElementById('close-external-events'),
        closeWorldEventsBtn: document.getElementById('close-world-events'),
        internalEventsList: document.getElementById('internal-events-list'),
        externalEventsList: document.getElementById('external-events-list'),
        worldEventsList: document.getElementById('world-events-list'),
        yearSlider: document.getElementById('year-slider'),
        mapImage: document.getElementById('map-image'),
        mapElement: document.querySelector('map[name="map1900-1904"]'),
        selectedYearDisplay: document.getElementById('selected-year'),
    };

    let currentUsername = null;
    let mapData = {};
    let mapsData = [];
    let eventsData = {};
    let mapInfoData = {};
    let mapMarkersData = {};

    // --- Helper Functions ---
    const showMessage = (el, type, msg) => {
        el.textContent = msg;
        el.className = `message ${type}`;
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 3000);
    };

    const displayUserGreeting = (username) => {
        dom.userGreeting.textContent = `Вы авторизованы как ${username}`;
        dom.userGreeting.style.display = 'block';
        dom.feedbackFormContainer.style.display = 'block';
        dom.authBtns.style.display = 'none';
        dom.logoutBtn.style.display = 'inline-block';
        currentUsername = username;

        // Add this code to switch to the comments tab
        dom.sections.forEach(s => s.classList.remove('active'));
        document.getElementById('comments-section').classList.add('active');
        dom.sectionBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-section="comments"]').classList.add('active');
    };

    const loadFeedback = () => {
        fetch('/feedback')
            .then(resp => resp.json())
            .then(feedback => displayFeedback(feedback))
            .catch(err => {
                console.error('Ошибка загрузки отзывов:', err);
                dom.feedbackDisplay.textContent = 'Ошибка загрузки комментариев.';
            });
    };

    const displayFeedback = (feedback) => {
        dom.feedbackDisplay.innerHTML = '';
        const feedbackItems = Object.entries(feedback).map(([username, item]) => {
            const cleanedText = item.text.replace(/[\r\n]+/g, ' ');
            return `<div class="feedback-item">
                        <div class="feedback-username">${username}:</div>
                        <div class="feedback-text">${cleanedText}</div>
                    </div>`;
        }).join('');

        dom.feedbackDisplay.innerHTML = feedbackItems || 'Пока нет комментариев.';
    };

    const logout = () => {
        localStorage.removeItem('token');
        dom.userGreeting.style.display = 'none';
        dom.feedbackFormContainer.style.display = 'none';
        dom.authBtns.style.display = 'flex';
        dom.logoutBtn.style.display = 'none';
        currentUsername = null;
        alert('Вы вышли.');
    };

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Ошибка при загрузке ${url}:`, error);
            throw error;
        }
    };

    const loadMapsData = () => fetchData('maps.json').then(data => {
        mapsData = data;
        console.log('Данные о maps загружены:', mapsData);
        updateMap();
    });

    const loadMapData = () => fetchData('map_data.json').then(data => {
        mapData = data;
        console.log('Данные о map загружены:', mapData);
        updateMap();
    });

    const loadEventsData = () => fetchData('events.json').then(data => {
        eventsData = data;
        console.log('Данные о events загружены:', eventsData);
        updateModalContent(dom.yearSlider.value);
    });

    const loadMapInfoData = () => fetchData('map_info.json').then(data => {
        mapInfoData = data;
        console.log('Данные о map_info загружены:', mapInfoData);
        updateModalContent(dom.yearSlider.value);
    });

    const loadMapMarkersData = () => fetchData('map_markers.json').then(data => {
        mapMarkersData = data;
        console.log('Данные о метках загружены:', mapMarkersData);
        updateMapMarkers(dom.yearSlider.value);
    });

    const getMapImageSource = (selectedYear) => {
        let mapImageSrc = '';

        if (selectedYear >= 1900 && selectedYear <= 1904) mapImageSrc = 'Карты/1900-1904.png';
        else if (selectedYear === 1905) mapImageSrc = 'Карты/1905.png';
        else if (selectedYear >= 1906 && selectedYear <= 1907) mapImageSrc = 'Карты/1906-1907.png';
        else if (selectedYear === 1908) mapImageSrc = 'Карты/1908.png';
        else if (selectedYear >= 1909 && selectedYear <= 1910) mapImageSrc = 'Карты/1909-1910.png';
        else if (selectedYear === 1911) mapImageSrc = 'Карты/1911.png';
        else if (selectedYear === 1912) mapImageSrc = 'Карты/1912.png';
        else if (selectedYear === 1913) mapImageSrc = 'Карты/1913.png';
        else if (selectedYear === 1914) mapImageSrc = 'Карты/1914.png';
        else if (selectedYear === 1915) mapImageSrc = 'Карты/1915.png';
        else if (selectedYear === 1916) mapImageSrc = 'Карты/1916.png';
        else if (selectedYear === 1917) mapImageSrc = 'Карты/1917.png';
        else if (selectedYear === 1918) mapImageSrc = 'Карты/1918.png';
        else if (selectedYear === 1919) mapImageSrc = 'Карты/1919.png';
        else if (selectedYear === 1920) mapImageSrc = 'Карты/1920.png';
        else if (selectedYear === 1921) mapImageSrc = 'Карты/1921.png';
        else if (selectedYear === 1922) mapImageSrc = 'Карты/1922.png';
        else if (selectedYear === 1923) mapImageSrc = 'Карты/1923.png';
        else if (selectedYear === 1924) mapImageSrc = 'Карты/1924.png';
        else if (selectedYear === 1925) mapImageSrc = 'Карты/1925.png';
        else if (selectedYear === 1926) mapImageSrc = 'Карты/1926.png';
        else if (selectedYear >= 1927 && selectedYear <= 1929) mapImageSrc = 'Карты/1927-1929.png';
        else if (selectedYear === 1930) mapImageSrc = 'Карты/1930.png';
        else if (selectedYear === 1931) mapImageSrc = 'Карты/1931.png';
        else if (selectedYear >= 1932 && selectedYear <= 1938) mapImageSrc = 'Карты/1932-1938.png';
        else if (selectedYear === 1939) mapImageSrc = 'Карты/1939.png';
        else if (selectedYear === 1940) mapImageSrc = 'Карты/1940.png';
        else if (selectedYear === 1941) mapImageSrc = 'Карты/1941.png';
        else if (selectedYear === 1942) mapImageSrc = 'Карты/1942.png';
        else if (selectedYear === 1943) mapImageSrc = 'Карты/1943.png';
        else if (selectedYear === 1944) mapImageSrc = 'Карты/1944.png';
        else if (selectedYear === 1945) mapImageSrc = 'Карты/1945.png';
        else if (selectedYear >= 1946 && selectedYear <= 1949) mapImageSrc = 'Карты/1946-1949.png';
        else if (selectedYear === 1950) mapImageSrc = 'Карты/1950.png';
        else if (selectedYear === 1951) mapImageSrc = 'Карты/1951.png';
        else if (selectedYear >= 1952 && selectedYear <= 1953) mapImageSrc = 'Карты/1952-1953.png';
        else if (selectedYear === 1954) mapImageSrc = 'Карты/1954.png';
        else if (selectedYear >= 1955 && selectedYear <= 1990) mapImageSrc = 'Карты/1955-1990.png';
        else if (selectedYear === 1991) mapImageSrc = 'Карты/1991.png';
        else if (selectedYear >= 1992 && selectedYear <= 1993) mapImageSrc = 'Карты/1997-1998.png';
        else if (selectedYear === 1994) mapImageSrc = 'Карты/1994.png';
        else if (selectedYear === 1995) mapImageSrc = 'Карты/1995.png';
        else if (selectedYear === 1996) mapImageSrc = 'Карты/1996.png';
        else if (selectedYear >= 1997 && selectedYear <= 1998) mapImageSrc = 'Карты/1997-1998.png';
        else if (selectedYear === 1999) mapImageSrc = 'Карты/1999.png';
        else if (selectedYear === 2000) mapImageSrc = 'Карты/2000.png';

        return mapImageSrc;
    };

    const updateMap = () => {
        const selectedYear = parseInt(dom.yearSlider.value);
        dom.selectedYearDisplay.textContent = `${selectedYear}`;
        dom.mapImage.src = getMapImageSource(selectedYear);
        updateMapMarkers(selectedYear);
    };

    const updateMapMarkers = (year) => {
        const yearStr = String(year);
        dom.mapElement.innerHTML = '';

        if (mapMarkersData[yearStr]) {
            mapMarkersData[yearStr].forEach(marker => {
                const area = document.createElement('area');
                Object.assign(area, {
                    shape: marker.shape,
                    coords: marker.coords,
                    alt: marker.name,
                    title: marker.name,
                });
                area.addEventListener('click', () => alert(marker.description));
                dom.mapElement.appendChild(area);
            });
        }
    };

    const updateModalContent = (year) => {
        const yearStr = String(year);
        const yearData = mapInfoData[yearStr] || {};

        dom.aboutModal.querySelector('.modal-content p').textContent = yearData.about || 'Информация отсутствует';
        dom.internalEventsList.innerHTML = (yearData.internal || []).map(event => `<li>${event}</li>`).join('') || '<li>Не установлено событие</li>';
        dom.externalEventsList.innerHTML = (yearData.external || []).map(event => `<li>${event}</li>`).join('') || '<li>Не установлено событие</li>';
        dom.worldEventsList.innerHTML = (yearData.world || []).map(event => `<li>${event}</li>`).join('') || '<li>Не установлено событие</li>';
    };

    const openModal = (modalType) => {
        const selectedYear = dom.yearSlider.value;
        const yearData = mapInfoData[selectedYear] || {};
        let modal;

        switch (modalType) {
            case 'about':
                dom.aboutModal.querySelector('.modal-content p').textContent = yearData.about || 'Информация отсутствует';
                modal = dom.aboutModal;
                break;
            case 'internal':
                dom.internalEventsList.innerHTML = (yearData.internal || []).map(event => `<li>${event}</li>`).join('') || '<li>Не установлено событие</li>';
                modal = dom.internalEventsModal;
                break;
            case 'external':
                dom.externalEventsList.innerHTML = (yearData.external || []).map(event => `<li>${event}</li>`).join('') || '<li>Не установлено событие</li>';
                modal = dom.externalEventsModal;
                break;
            case 'world':
                dom.worldEventsList.innerHTML = (yearData.world || []).map(event => `<li>${event}</li>`).join('') || '<li>Не установлено событие</li>';
                modal = dom.worldEventsModal;
                break;
            default:
                return;
        }

        modal.style.display = 'block';

        document.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal(modal);
                document.removeEventListener('click', arguments.callee);
            }
        });
    };

    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    // --- Event Listeners ---
    dom.openAboutBtn.addEventListener('click', () => {
        closeModal(dom.internalEventsModal);
        closeModal(dom.externalEventsModal);
        closeModal(dom.worldEventsModal);
        openModal('about');
    });

    dom.openInternalEventsBtn.addEventListener('click', () => {
        closeModal(dom.aboutModal);
        closeModal(dom.externalEventsModal);
        closeModal(dom.worldEventsModal);
        openModal('internal');
    });

    dom.openExternalEventsBtn.addEventListener('click', () => {
        closeModal(dom.aboutModal);
        closeModal(dom.internalEventsModal);
        closeModal(dom.worldEventsModal);
        openModal('external');
    });

    dom.openWorldEventsBtn.addEventListener('click', () => {
        closeModal(dom.aboutModal);
        closeModal(dom.internalEventsModal);
        closeModal(dom.externalEventsModal);
        openModal('world');
    });

    dom.closeAboutBtn.addEventListener('click', () => closeModal(dom.aboutModal));
    dom.closeInternalEventsBtn.addEventListener('click', () => closeModal(dom.internalEventsModal));
    dom.closeExternalEventsBtn.addEventListener('click', () => closeModal(dom.externalEventsModal));
    dom.closeWorldEventsBtn.addEventListener('click', () => closeModal(dom.worldEventsModal));

    dom.sectionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sectionId = e.target.dataset.section + '-section';
            dom.sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            dom.sectionBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    dom.openLoginBtn.addEventListener('click', () => {
        dom.loginContainer.classList.remove('hidden');
        dom.registerContainer.classList.add('hidden');
    });

    dom.openRegisterBtn.addEventListener('click', () => {
        dom.registerContainer.classList.remove('hidden');
        dom.loginContainer.classList.add('hidden');
    });

    dom.logoutBtn.addEventListener('click', logout);

    dom.feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = dom.feedbackText.value;
        if (!text) return alert('Введите комментарий.');
        if (text.length > 256) return alert('Длина до 256.');

        const token = localStorage.getItem('token');
        if (!token) return alert('Авторизуйтесь.');

        try {
            const resp = await fetch('/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            const data = await resp.json();

            if (data.message === 'Feedback submitted successfully.') {
                dom.feedbackText.value = '';
                loadFeedback();
            } else {
                alert('Ошибка отправки: ' + data.message);
            }
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Ошибка отправки: ' + err);
        }
    });

    dom.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) return showMessage(dom.loginMsg, 'error', 'Заполните все поля.');

        try {
            const resp = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();

            if (data.message === 'Login successful.') {
                showMessage(dom.loginMsg, 'success', 'Вход успешен!');
                localStorage.setItem('token', data.token);
                displayUserGreeting(data.username);
                dom.loginContainer.classList.add('hidden');
                loadFeedback();
            } else {
                showMessage(dom.loginMsg, 'error', data.message);
            }
        } catch (err) {
            console.error('Ошибка:', err);
            showMessage(dom.loginMsg, 'error', 'Ошибка входа: ' + err);
        }
    });

    dom.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;

        if (!username || !email || !password || !confirmPassword)
            return showMessage(dom.registerMsg, 'error', 'Заполните все поля.');
        if (username.includes(' ')) return showMessage(dom.registerMsg, 'error', 'Имя без пробелов.');
        if (password !== confirmPassword) return showMessage(dom.registerMsg, 'error', 'Пароли не совпадают.');

        try {
            const resp = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await resp.json();

            if (data.message === 'User registered successfully.') {
                showMessage(dom.registerMsg, 'success', 'Регистрация успешна!');
                dom.registerContainer.classList.add('hidden');

                // Add this code to switch to the comments tab
                dom.sections.forEach(s => s.classList.remove('active'));
                document.getElementById('comments-section').classList.add('active');
                dom.sectionBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-section="comments"]').classList.add('active');
            } else {
                showMessage(dom.registerMsg, 'error', data.message);
            }
        } catch (err) {
            console.error('Ошибка:', err);
            showMessage(dom.registerMsg, 'error', 'Ошибка регистрации: ' + err);
        }
    });

    // --- Initialization ---
    const init = () => {
        loadFeedback();
        loadMapsData();
        loadMapData();
        loadEventsData();
        loadMapInfoData();
        loadMapMarkersData();

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                displayUserGreeting(decodedToken.username);
            } catch (err) {
                console.error("Ошибка при расшифровке токена:", err);
                logout();
            }
        }
        dom.yearSlider.addEventListener('input', () => {
            updateMap();
            updateMapMarkers(dom.yearSlider.value);
            updateModalContent(dom.yearSlider.value);
        });
    };

    init();
});
