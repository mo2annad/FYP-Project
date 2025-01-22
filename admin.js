// Product Management
let products = [];

function showAddProductModal() {
    const form = document.getElementById('addProductForm');
    form.reset(); // Reset the form fields
    form.removeAttribute('data-editing-card'); // Remove editing flag
    form.removeAttribute('data-editing-id'); // Remove editing ID
    document.getElementById('addProductModal').style.display = 'block';
}

// Close modal when clicking the X
document.querySelector('.close').onclick = function() {
    document.getElementById('addProductModal').style.display = 'none';
}

// Function to save product cards to localStorage
function saveProductCards() {
    const productsGrid = document.querySelector('.products-grid');
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    
    // Create an array to hold product data
    const productsData = Array.from(productsGrid.children).map(card => {
        return {
            name: card.querySelector('h3').textContent,
            price: card.querySelector('.price').textContent.replace('$ ', ''),
            size: card.querySelector('.size').textContent.replace('Size: ', ''),
            description: card.querySelector('.description').textContent,
            type: card.dataset.category, // Assuming you have a way to get the type
            id: card.dataset.id // Assuming you have a unique ID for each product
        };
    });

    localStorage.setItem(productCards_${activeCategory}, JSON.stringify(productsData));
}

// Function to add new product
async function addProduct(formData) {
    const productsGrid = document.querySelector('.products-grid');
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'default';

    // Create new product card
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-category', activeCategory);
    productCard.setAttribute('data-id', Date.now()); // Use timestamp as unique ID

    // Create image preview
    const reader = new FileReader();
    reader.onload = async function (e) {
        productCard.innerHTML = `
            <img src="${e.target.result}" alt="${formData.get('name')}">
            <div class="product-details">
                <h3>${formData.get('name')}</h3>
                <p class="price">$ ${formData.get('price')}</p>
                <p class="size">Size: ${formData.get('size')}</p>
                <p class="description">${formData.get('description')}</p>
                <div class="admin-actions">
                    <button class="edit-btn" onclick="editProduct(this)">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(this)">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        // Add the new card to the grid
        productsGrid.appendChild(productCard);

        // Prepare product data for API submission
        const productData = new FormData();
        productData.append('name', formData.get('name'));
        productData.append('price', formData.get('price'));
        productData.append('size', formData.get('size'));
        productData.append('description', formData.get('description'));
        productData.append('type', activeCategory);
        productData.append('image', formData.get('image')); 

        console.log(formData.get('image'))

        // Send product data to the server
        try {
            const response = await fetch("http://localhost:3000/api/add-product", {
                method: 'POST',
                body: productData, // Send FormData directly
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Product added successfully. Server response:', result);
            } else {
                console.error('Failed to add product. Status:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    };

    reader.readAsDataURL(formData.get('image')); // Preview the uploaded image
}



async function getAllProducts() {
    try {
        const response = await fetch("http://localhost:3000/api/products"); // API endpoint

        if (!response.ok) {
            console.error(Failed to fetch products: ${response.status} ${response.statusText});
            return;
        }

        const jsonData = await response.json(); // Parse JSON from response

        // Ensure the response structure is correct
        if (jsonData.products && Array.isArray(jsonData.products)) {
            const panel = document.getElementById("xxx");

            if (!panel) {
                console.error("Element with ID 'products-section' not found.");
                return;
            }

            console.log(jsonData);

            // Add CSS styles dynamically
            const style = document.createElement('style');
            style.textContent = `
                .product-card {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 12px 0;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    background-color: #f9f9f9;
                }
                .product-card h2 {
                    margin: 8px 0;
                    font-size: 18px;
                    color: #333;
                }
            `;
            document.head.appendChild(style); // Append styles to the document head

            // Clear the panel before adding new content (optional)
            panel.innerHTML = '';

            // Create and style product cards
            jsonData.products.forEach(product => {
                const child = document.createElement('div');
                child.className = 'product-card'; // Use the CSS class defined above
                child.innerHTML = `
                    <h2>Name: ${product.name}</h2>
                    <h2>Size: ${product.size || 'N/A'}</h2>
                    <h2>Price: $${product.price}</h2>
                    <h2>Type: ${product.type || 'N/A'}</h2>
                `;
                panel.appendChild(child);
            });
        } else {
            console.error("Unexpected response structure:", jsonData);
        }
    } catch (error) {
        console.error("Error fetching or displaying products:", error);
    }
}

getAllProducts()
// Call the function to load products

// Call the stub function to test the connection


    
// Function to handle form submission
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    if (this.hasAttribute('data-editing-card')) {
        // If editing, update the product
        const productId = this.getAttribute('data-editing-id');
        updateProduct(productId, formData);
    } else {
        // If adding, create a new product
        addProduct(formData);
    }
    
    document.getElementById('addProductModal').style.display = 'none';
    this.reset(); // Reset the form after submission
});

// Function to delete product
function deleteProduct(button) {
    button.closest('.product-card').remove();
    saveProductCards();
}

// Function to restore products from localStorage
function restoreProductCards() {
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    const savedCards = localStorage.getItem(productCards_${activeCategory});
    
    if (savedCards) {
        const productsData = JSON.parse(savedCards);
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = ''; // Clear existing content

        productsData.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-id', product.id); // Set unique ID for editing
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p class="price">$ ${product.price}</p>
                <p class="size">Size: ${product.size}</p>
                <p class="description">${product.description}</p>
                <div class="admin-actions">
                    <button class="edit-btn" onclick="editProduct(this)">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(this)">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    restoreProductCards();
    
    // Modal close button
    const closeBtn = document.querySelector('.modal .close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('addProductModal').style.display = 'none';
        };
    }
    
    // Show modal function
    window.showAddProductModal = function() {
        document.getElementById('addProductModal').style.display = 'block';
    };
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('addProductModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
    
    // Initialize sections
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // Load the default section (men)
    loadSection('men');
    
    // Add click handlers for category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Load the selected section
            const category = this.dataset.category;
            loadSection(category);
        });
    });
});

function loadSection(category) {
    // Get the products grid
    const productsGrid = document.querySelector('.products-grid');
    
    // Clear existing content
    productsGrid.innerHTML = '';
}

// Notification System
let notifications = [];

function addNotification(message) {
    notifications.push({
        id: Date.now(),
        message,
        read: false
    });
    updateNotificationCount();
}

function updateNotificationCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    document.querySelector('.notification-count').textContent = unreadCount;
}

// Initialize the page

// Function to edit product
function editProduct(button) {
    const productCard = button.closest('.product-card');
    const name = productCard.querySelector('h3').textContent;
    const price = productCard.querySelector('.price').textContent.replace('$ ', '');
    const size = productCard.querySelector('.size').textContent.replace('Size: ', '');
    const description = productCard.querySelector('.description').textContent;

    // Populate the form with existing product data
    const form = document.getElementById('addProductForm');
    form.name.value = name;
    form.price.value = price;
    form.size.value = size;
    form.description.value = description;

    // Set a flag to indicate editing
    form.setAttribute('data-editing-card', 'true');
    form.setAttribute('data-editing-id', productCard.dataset.id); // Assuming you have a data-id attribute for the product
    showAddProductModal();
}

// Function to update product
function updateProduct(productId, formData) {
    const productCard = document.querySelector(.product-card[data-id="${productId}"]);
    if (productCard) {
        productCard.querySelector('h3').textContent = formData.get('name');
        productCard.querySelector('.price').textContent = $ ${formData.get('price')};
        productCard.querySelector('.size').textContent = Size: ${formData.get('size')};
        productCard.querySelector('.description').textContent = formData.get('description');
        
        // Save updated product to localStorage
        saveProductCards();
    }
}