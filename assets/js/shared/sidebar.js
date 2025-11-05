(function() {
    'use strict';

    async function loadSidebar() {
        try {
            const response = await fetch('/components/doctor/sidebar.html');
            if (!response.ok) {
                throw new Error('Failed to load sidebar');
            }
            const sidebarHTML = await response.text();

            const sidebarContainer = document.createElement('div');
            sidebarContainer.id = 'doctor-sidebar-container';
            sidebarContainer.innerHTML = sidebarHTML;

            document.body.insertBefore(sidebarContainer, document.body.firstChild);

            createOverlay();

            initializeSidebar();

            setupToggleButton();

        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    function setupToggleButton() {
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleSidebarCollapse);
        }
    }

    function toggleSidebarCollapse() {
        const sidebar = document.querySelector('.doctor-sidebar');
        const mainContent = document.querySelector('.main-content, .container');

        if (sidebar) {
            sidebar.classList.toggle('collapsed');

            // Save state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);

            // Adjust main content margin
            if (mainContent && window.innerWidth > 768) {
                mainContent.style.marginLeft = isCollapsed ? '70px' : '260px';
            }
        }
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

        loadDoctorInfo();

        setupMobileNavigation();

        restoreSidebarState();
    }

    function restoreSidebarState() {
        const sidebar = document.querySelector('.doctor-sidebar');
        const mainContent = document.querySelector('.main-content, .container');
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

        if (isCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            if (mainContent && window.innerWidth > 768) {
                mainContent.style.marginLeft = '70px';
            }
        }
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
                        const response = await fetch('/api/logout', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
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

    async function loadDoctorInfo() {
        try {
            const cachedInfo = sessionStorage.getItem('doctorInfo');

            if (cachedInfo) {
                const doctorInfo = JSON.parse(cachedInfo);
                updateDoctorDisplay(doctorInfo);
            } else {
                const response = await fetch('/api/doctor/dashboard', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const doctorInfo = data.doctorInfo;

                    sessionStorage.setItem('doctorInfo', JSON.stringify(doctorInfo));

                    updateDoctorDisplay(doctorInfo);
                } else if (response.status === 401) {
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error('Error loading doctor info:', error);
        }
    }

    function updateDoctorDisplay(doctorInfo) {
        const nameElement = document.getElementById('sidebar-doctor-name');
        const specialtyElement = document.getElementById('sidebar-doctor-specialty');
        const avatarElement = document.getElementById('sidebar-doctor-avatar');

        if (doctorInfo.firstName && doctorInfo.lastName) {
            if (nameElement) {
                nameElement.textContent = `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
            }

            if (avatarElement) {
                const initials = doctorInfo.firstName.charAt(0) + doctorInfo.lastName.charAt(0);
                avatarElement.textContent = initials;
            }
        }

        if (doctorInfo.specialization && specialtyElement) {
            specialtyElement.textContent = doctorInfo.specialization;
        }
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
        const sidebar = document.querySelector('.doctor-sidebar');
        const mainContent = document.querySelector('.main-content, .container');

        if (mainContent && window.innerWidth > 768) {
            const isCollapsed = sidebar && sidebar.classList.contains('collapsed');
            mainContent.style.marginLeft = isCollapsed ? '70px' : '260px';
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

    window.refreshDoctorSidebar = loadDoctorInfo;

})();
