let cart = []; // Global cart variable for storing cart items

// Function to extract the product ID from the URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // Assuming the URL looks like: productDetail.html?id=123
}

// Function to fetch product details from the backend
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);

        if (!response.ok) {
            console.error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
            return;
        }

        const product = await response.json();

        // Fill the product details in the page
        const productDetailContainer = document.getElementById('product-detail');
        productDetailContainer.innerHTML = `
        <section id="prodetails" class="section-p1">
          <div class="single-pro-image">
            <img loading="lazy" src="${product.images[0]}" width="100%" id="MainImg" alt="">
            <div class="small-img-group">
                ${product.images.map(image => `<div class="small-img-col"><img loading="lazy" src="${image}" width="100%" class="small-img" alt=""></div>`).join('')}    
               
            </div>
        </div>
        <div class="single-pro-details">
            <h6>Thobe</h6>
            <h4>${product.name}</h4>
            <h2 id="product-price">$${product.price}</h2>
            <select id="product-size">
                <option value="Select Size">Select Size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
            </select>
            <input type="number" value="1" id="product-quantity" min="1" onchange="updatePrice()"> 
            <h4>Product Details</h4>
            <span>${product.description}</span>
            <button id="addToCartButton" class="normal">Add To Cart</button>
        </div>
    </section>
        `;
        var MainImg = document.getElementById("MainImg");
        var smalling = document.getElementsByClassName("small-img");
        
        smalling[0].onclick= function(){
            MainImg.src = smalling[0].src;
        }
        smalling[1].onclick= function(){
            MainImg.src = smalling[1].src;
        }
        smalling[2].onclick=function(){
            MainImg.src = smalling[2].src;
        }
        smalling[3].onclick= function(){
            MainImg.src = smalling[3].src;
        }

        fetchReviews(productId);

        // Add click event listener after the button is created
        document.getElementById('addToCartButton').addEventListener('click', () => {
            const selectedSize = document.getElementById('product-size').value;
            const quantity = parseInt(document.getElementById('product-quantity').value);

            if (selectedSize === 'Select Size') {
                alert('Please select a size');
                return;
            }

            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                size: selectedSize,
                quantity: quantity,
                image: product.images[0]
            };

            // Get existing cart or initialize new one
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Check if product with same ID and size exists
            const existingItemIndex = cart.findIndex(item => 
                item.id === cartItem.id && item.size === cartItem.size
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                cart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item if it doesn't exist
                cart.push(cartItem);
            }

            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Product added to cart successfully!');
        });

    } catch (error) {
        console.error("Error fetching product details:", error);
    }
}

// Function to render stars based on rating
function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += `<i class="fa fa-star${i < rating ? '' : '-o'}"></i>`;
    }
    return stars;
}

// Function to fetch and display reviews
async function fetchReviews(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/reviews/${productId}`);

        if (!response.ok) {
            console.error('Failed to fetch reviews:', response.status);
            return;
        }

        const reviews = await response.json();
        console.log(reviews)
        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = '';

        reviews.reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="star">${renderStars(review.rating)}</div>
                <p><strong>${review.user.name}:</strong> ${review.comment}</p>
            `;
            reviewsList.appendChild(reviewItem);
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }

    
}

document.getElementById('submit-review').addEventListener('click', async () => {
    const productId = getProductIdFromUrl(); // Get productId from URL
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('review-comment').value;
    const userId = localStorage.getItem("currentUserId"); // This should be retrieved from the logged-in user (replace with actual user ID)

    if (!rating || !comment) {
        alert("Please provide a rating and a comment.");
        return;
    }

    const review = {
        rating: parseInt(rating),
        comment: comment,
        productId: Number(productId),
        userId: userId, 
    };

    try {
        const response = await fetch(`http://localhost:3000/api/reviews`, { // No need for productId in the URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(review), // Send review data in the body
        });

        if (!response.ok) {
            console.error(`Failed to submit review: ${response.status} ${response.statusText}`);
            return;
        }

        alert("Review submitted successfully!");
        fetchReviews(productId); // Refresh reviews (fetchReviews function should be defined to display reviews)
    } catch (error) {
        console.error("Error submitting review:", error);
    }
});

// On page load, get the product ID from the URL and fetch the product details
window.onload = () => {
    const productId = getProductIdFromUrl();
    if (productId) {
        fetchProductDetails(productId);
    } else {A
        console.error("Product ID not provided");
    }
};


