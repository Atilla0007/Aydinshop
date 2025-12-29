document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const subMenus = sidebar ? sidebar.querySelectorAll('.sub-menu') : [];
    const buttons = sidebar ? sidebar.querySelectorAll('button') : [];

    const openSidebar = () => {
        if (!sidebar) return;
        sidebar.classList.add('open');
        overlay?.classList.add('show');
        document.body.classList.add('sidebar-open');
    };

    const closeSidebar = () => {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        overlay?.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    };

    const resetSidebarState = () => {
        buttons.forEach((btn) => btn.classList.remove('active'));
        subMenus.forEach((menu) => {
            menu.style.height = 0;
        });
    };

    const openSubmenu = (element) => {
        resetSidebarState();
        element.classList.add('active');
        const sibling = element.nextElementSibling;
        const ul = sibling.querySelector('ul');
        if (sibling.clientHeight === 0) {
            sibling.style.height = `${ul.clientHeight}px`;
        } else {
            sibling.style.height = 0;
            element.classList.remove('active');
        }
    };

    const gotoPage = (element) => {
        resetSidebarState();
        element.classList.add('active');
        const url = element.dataset.url;
        closeSidebar();
        if (url) {
            window.location.href = url;
        }
    };

    sidebar?.addEventListener('click', (event) => {
        const target = event.target;
        const button = target && target.closest ? target.closest('button[data-url]') : null;
        if (!button) return;
        event.preventDefault();
        gotoPage(button);
    });

    toggle?.addEventListener('click', () => {
        if (!sidebar) return;
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    closeBtn?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            closeSidebar();
        }
    });

    // expose for inline handlers
    window.openSubmenu = openSubmenu;
    window.gotoPage = gotoPage;
});
