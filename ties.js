document.addEventListener('DOMContentLoaded', function() {
    // Gallery horizontal scroll with mouse wheel
    const gallery = document.getElementById('gallery');
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
    const loader = document.getElementById("loader");
    const galleryItems = document.querySelectorAll(".gallery-item");

    // Hide loader after animation
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none"; // Remove loader

            

        }, 1000); // Ensure smooth fade out
    }, 2000); // Loader duration
});