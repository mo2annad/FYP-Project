// Intro Animation
document.addEventListener('DOMContentLoaded', function() {
    // Only show intro if page was refreshed
    if (performance.navigation.type === 1) {
        const intro = document.querySelector('.intro');
        if (!intro) return;

        // Disable scrolling during intro
        document.body.style.overflow = 'hidden';

        // Hide intro after 0.7 seconds
        setTimeout(() => {
            intro.classList.add('fade-out');
            
            // Remove intro and enable scrolling after 0.3 second fade
            setTimeout(() => {
                intro.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }, 500);
    } else {
        // If not refreshed, remove intro immediately
        const intro = document.querySelector('.intro');
        if (intro) intro.remove();
    }
});
//end intro

//start star rating
document.addEventListener('DOMContentLoaded', function() {
    // Get all rating containers
    const ratingContainers = document.querySelectorAll('.rating-container');

    ratingContainers.forEach(container => {
        const productId = container.dataset.productId; // Add this attribute to your HTML
        const stars = container.querySelectorAll('.stars i');
        const ratingCount = container.querySelector('.rating-count');
        
        // Get stored values for this specific product
        let reviewCount = parseInt(localStorage.getItem(`reviewCount_${productId}`)) || 0;
        let currentRating = parseInt(localStorage.getItem(`currentRating_${productId}`)) || 0;

        // Initialize stars for this container
        highlightStars(stars, currentRating);
        updateReviewCount(ratingCount, reviewCount);

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.dataset.rating;
                if (currentRating === parseInt(rating)) {
                    currentRating = 0;
                    reviewCount = Math.max(0, reviewCount - 1);
                } else {
                    if (currentRating === 0) reviewCount++;
                    currentRating = parseInt(rating);
                }
                
                highlightStars(stars, currentRating);
                updateReviewCount(ratingCount, reviewCount);
                
                // Save to localStorage with unique product ID
                localStorage.setItem(`currentRating_${productId}`, currentRating);
                localStorage.setItem(`reviewCount_${productId}`, reviewCount);
            });
        });
    });

    function highlightStars(stars, rating) {
        stars.forEach(star => {
            const starRating = star.dataset.rating;
            star.className = starRating <= rating ? 'fas fa-star' : 'far fa-star';
        });
    }

    function updateReviewCount(element, count) {
        element.textContent = `${count} review${count !== 1 ? 's' : ''}`;
    }
});
//end star rating


//start read more
$(document).ready(function() {
    $(".read-more-text").hide();

    $(document).on('click', ".read-more-btn", function() {
        var $box = $(this).parent(".details-box");
        var $invisibleContent = $box.find(".read-more-text");
        var $visibleContent = $box.find(".blog-details");
        
        var isVisible = $invisibleContent.is(":visible");
        $(this).text(isVisible ? 'READ MORE' : 'READ LESS');
        $invisibleContent.toggle();
        $visibleContent.toggle();
        
        // Optional: Set aria-expanded for accessibility
        $(this).attr('aria-expanded', !isVisible);
    });
});
//end read more


//start navbar
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
    nav.classList.add('active');
    })
}

if (close) {
    close.addEventListener('click', () => {
    nav.classList.remove('active');
    })
}

let currentIndex = 0;
const items = document.querySelectorAll('.carousel-item');
const dots = document.querySelectorAll('.dot');
const totalItems = items.length;

document.querySelector('.next').addEventListener('click', () => {
    moveToNextSlide();
    resetAutoPlay();
});

document.querySelector('.prev').addEventListener('click', () => {
    moveToPrevSlide();
    resetAutoPlay();
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        moveToSlide(index);
        resetAutoPlay();
    });
});

function moveToNextSlide() {
    currentIndex = (currentIndex + 1) % totalItems;
    updateCarousel();
}

function moveToPrevSlide() {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
}

function moveToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

function updateCarousel() {
    items.forEach(item => item.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    items[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');

    document.querySelector('.carousel-inner').style.transform = `translateX(-${currentIndex * 100}%)`;
}

let autoPlay = setInterval(moveToNextSlide, 3000);

function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(moveToNextSlide, 3000);
}
//--end navbar

// Scroll Top Button
document.addEventListener('DOMContentLoaded', function() {
    const scrollTop = document.getElementById('scroll-top');
    
    // Show button when page is scrolled up to given distance
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTop.classList.add('active');
        } else {
            scrollTop.classList.remove('active');
        }
    });

    // Scroll to top when button is clicked
    scrollTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});


// Signup Page
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.querySelector('.wrapper form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = this.querySelector('input[name="username"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const password = this.querySelector('input[name="password"]').value;
            const confirmPassword = this.querySelector('input[name="confirm_password"]').value;
            
            // Basic validation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            // If validation passes, submit the form
            this.submit();
        });
        
        // Show/Hide password functionality
        const passwordInputs = signupForm.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            const icon = input.nextElementSibling;
            if (icon) {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', () => {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    icon.className = `bx ${type === 'password' ? 'bxs-lock' : 'bxs-lock-open'}`;
                });
            }
        });
    }
});

// Login Page
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.wrapper form');
    
    if (loginForm && loginForm.querySelector('h1').textContent === 'Login') {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Basic validation
            if (!username || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            // Remember me functionality
            const rememberMe = this.querySelector('input[type="checkbox"]').checked;
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
            
            // Add form action
            this.action = 'login_process.php';
            this.submit();
        });
        
        // Show/Hide password functionality
        const passwordInput = loginForm.querySelector('input[type="password"]');
        const passwordIcon = passwordInput.nextElementSibling;
        
        if (passwordIcon) {
            passwordIcon.style.cursor = 'pointer';
            passwordIcon.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                passwordIcon.className = `bx ${type === 'password' ? 'bxs-lock' : 'bxs-lock-open'}`;
            });
        }
        
        // Auto-fill remembered username
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            loginForm.querySelector('input[type="text"]').value = rememberedUsername;
            loginForm.querySelector('input[type="checkbox"]').checked = true;
        }
    }
});

function submitNewsletter() {
    const email = document.getElementById('newsletter-email').value;
    
    // Email validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Please enter a valid email address');
        return;
    }

    // Send to backend
    fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for subscribing to our newsletter!');
            document.getElementById('newsletter-email').value = '';
        } else {
            alert('Something went wrong. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    });
}

function addToCart() {
    const productName = document.querySelector('.single-pro-details h4').textContent;
    const productPrice = 78;
    const productQuantity = parseInt(document.getElementById('product-quantity').value);
    const productSize = document.getElementById('product-size').value;
    const productImage = document.getElementById('MainImg').src;
    const productUrl = window.location.pathname;
    const subtotal = productPrice * productQuantity;

    // Validate size selection
    if (productSize === 'Select Size') {
        alert('Please select a size before adding to cart');
        return;
    }

    const cartItem = {
        name: productName,
        price: productPrice,
        quantity: productQuantity,
        size: productSize,
        image: productImage,
        productUrl: productUrl,
        subtotal: subtotal
    };

    // Get existing cart items or initialize empty array
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Check if item with same name and size already exists
    const existingItemIndex = cartItems.findIndex(item => 
        item.name === cartItem.name && item.size === cartItem.size
    );

    if (existingItemIndex > -1) {
        // Update quantity and subtotal if item exists
        cartItems[existingItemIndex].quantity += productQuantity;
        cartItems[existingItemIndex].subtotal = 
            cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity;
    } else {
        // Add new item to the beginning of the cart array
        cartItems.unshift(cartItem);
    }
    
    // Save updated cart back to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Show success message
    const successMessage = document.getElementById('success-message');
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// New function for adding from product list
function addToCartFromList(element, productName, price, imageUrl) {
    const cartItem = {
        name: productName,
        price: price,
        quantity: 1,
        size: 'Default',
        image: imageUrl,
        productUrl: window.location.pathname,
        subtotal: price
    };

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    const existingItemIndex = cartItems.findIndex(item => 
        item.name === cartItem.name && item.size === cartItem.size
    );

    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += 1;
        cartItems[existingItemIndex].subtotal = 
            cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity;
    } else {
        cartItems.unshift(cartItem);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    const successMessage = element.parentElement.querySelector('.success-message');
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 2000);
}

// Add this new function
function updatePrice() {
    const basePrice = 78; // Base price of the product
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const totalPrice = basePrice * quantity;
    document.getElementById('product-price').textContent = `$${totalPrice}`;
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}