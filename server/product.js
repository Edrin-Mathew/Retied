// Get the product ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Fetch product details from the backend
async function fetchProductDetails() {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        // Update the page with product details
        document.getElementById('product-image').src = product.imageUrl;
        document.getElementById('product-name').innerText = product.name;
        document.getElementById('product-description').innerText = product.description;
        document.getElementById('product-price').innerText = `$${product.price}`;

        // Update sizes
        const sizesContainer = document.getElementById('product-sizes');
        sizesContainer.innerHTML = product.sizes.map(size => `<span>${size}</span>`).join(' ');

        // Update colors
        const colorsContainer = document.getElementById('product-colors');
        colorsContainer.innerHTML = product.colors.map(color => `<span>${color}</span>`).join(' ');
    } catch (err) {
        console.error('Error fetching product details:', err);
    }
}

fetchProductDetails();