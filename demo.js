document.addEventListener('DOMContentLoaded', function() {
    // Gallery horizontal scroll with mouse wheel
    const gallery = document.getElementById('gallery');
    
    if (gallery) {
        gallery.addEventListener('wheel', function(e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                gallery.scrollLeft += e.deltaY;
            }
        }, { passive: false });
        
        // Drag to scroll functionality
        let isDown = false;
        let startX;
        let scrollLeft;
        
        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            gallery.style.cursor = 'grabbing';
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
        });
        
        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
        });
        
        gallery.addEventListener('mouseup', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
        });
        
        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            gallery.scrollLeft = scrollLeft - walk;
        });
        
        // Set initial cursor style
        gallery.style.cursor = 'grab';
    }
    
    // Cookie banner functionality
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookies = document.getElementById('acceptCookies');
    const rejectCookies = document.getElementById('rejectCookies');
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieChoice');
    
    if (cookieChoice) {
        cookieBanner.style.display = 'none';
    }
    
    if (acceptCookies) {
        acceptCookies.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'accepted');
            cookieBanner.style.display = 'none';
        });
    }
    
    if (rejectCookies) {
        rejectCookies.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'rejected');
            cookieBanner.style.display = 'none';
        });
    }
});