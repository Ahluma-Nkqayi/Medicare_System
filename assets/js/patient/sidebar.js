(function() {
    'use strict';

    async function loadSidebar() {
        try {
            const response = await fetch('/components/patient/sidebar.html');
            if (!response.ok) {
                throw new Error('Failed to load sidebar');
            }
            const sidebarHTML = await response.text();

            const sidebarContainer = document.createElement('div');
            sidebarContainer.id = 'patient-sidebar-container';
            sidebarContainer.innerHTML = sidebarHTML;

            document.body.insertBefore(sidebarContainer, document.body.firstChild);

            createMobileToggle();

            createOverlay();

            initializeSidebar();

        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    function createMobileToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-label', 'Toggle sidebar');

        toggleBtn.addEventListener('click', toggleSidebar);

        document.body.appendChild(toggleBtn);
    }

    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
    }

    function toggleSidebar() {
        const sidebar = document.querySelector('.doctor-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    function closeSidebar() {
        const sidebar = document.querySelector('.doctor-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    function initializeSidebar() {
        setActiveMenuItem();

        setupLogoutButton();

        loadPatientInfo();

        setupMobileNavigation();
    }

    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && link.getAttribute('href')) {
                const href = link.getAttribute('href');

                if (currentPath.includes(href) ||
                    (currentPath.endsWith('/') && href.includes('dashboard'))) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }

    function setupLogoutButton() {
        const logoutBtn = document.getElementById('sidebar-logout-btn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function() {
                if (confirm('Are you sure you want to logout?')) {
                    try {
                        const response = await fetch('/api/auth/logout', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            sessionStorage.clear();
                            window.location.href = '/login';
                        } else {
                            console.error('Logout failed');
                            window.location.href = '/login';
                        }
                    } catch (error) {
                        console.error('Error during logout:', error);
                        window.location.href = '/login';
                    }
                }
            });
        }
    }

    async function loadPatientInfo() {
        try {
            const cachedInfo = sessionStorage.getItem('patientInfo');

            if (cachedInfo) {
                const patientInfo = JSON.parse(cachedInfo);
                updatePatientDisplay(patientInfo);
            } else {
                const response = await fetch('/api/patient/dashboard', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const patientInfo = data.patientInfo;

                    sessionStorage.setItem('patientInfo', JSON.stringify(patientInfo));

                    updatePatientDisplay(patientInfo);
                } else if (response.status === 401) {
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error('Error loading patient info:', error);
        }
    }

    function updatePatientDisplay(patientInfo) {
        // Patient sidebar doesn't have name/email display in the current design
        // This function is here for future enhancements
    }

    function setupMobileNavigation() {
        const navLinks = document.querySelectorAll('.nav-item a');

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
        });
    }

    function adjustMainContent() {
        const mainContent = document.querySelector('.main-content');

        if (mainContent && window.innerWidth > 768) {
            mainContent.style.marginLeft = '260px';
        }
    }

    function handleResize() {
        const sidebar = document.querySelector('.doctor-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (window.innerWidth > 768) {
            if (sidebar) {
                sidebar.classList.remove('active');
            }
            if (overlay) {
                overlay.classList.remove('active');
            }
        }

        adjustMainContent();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadSidebar();
            adjustMainContent();
        });
    } else {
        loadSidebar();
        adjustMainContent();
    }

    window.addEventListener('resize', handleResize);

    window.refreshPatientSidebar = loadPatientInfo;

})();
