        // Theme Toggle
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            document.getElementById('light-icon').classList.toggle('active');
            document.getElementById('dark-icon').classList.toggle('active');
            
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }

        // Load saved theme
        window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('light-icon').classList.remove('active');
                document.getElementById('dark-icon').classList.add('active');
            }
        });