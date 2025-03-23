// Function to change the main image when a thumbnail is clicked
function changeImage(imageSrc) {
    document.getElementById('main-image').src = imageSrc;
}

// Add event listeners to all thumbnails
document.querySelectorAll('.thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {
        // Remove the 'active' class from all thumbnails
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        
        // Add the 'active' class to the clicked thumbnail
        this.classList.add('active');
        
        // Change the main image
        const newImageSrc = this.getAttribute('data-img');
        changeImage(newImageSrc);
    });
});

// Function to add item to cart
function addToCart() {
    alert("Item added to cart!");
}