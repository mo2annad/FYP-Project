let products = [];
var typeOfProduct = "Men"
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

    localStorage.setItem(`productCards_${activeCategory}`, JSON.stringify(productsData));
}


// Function to add new product
async function addProduct(formData) {


    const imageFormData = new FormData();
    
    if (formData.getAll("image")) {
      formData.getAll("image").forEach((file) => {
        imageFormData.append("image", file);
      });
    }

    console.log("test")
    
    const requestOptions = {
      method: "POST",
      body: imageFormData,
    };
    
    const response = await fetch("http://localhost:3000/upload-multiple", requestOptions);
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    const ImagesUrl = data.urls
    
    

     
       


      
    
    const productsGrid = document.querySelector('.products-grid');
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'default';

    // // Create new product card
    // const productCard = document.createElement('div');
    // productCard.className = 'product-card';
    // productCard.setAttribute('data-category', activeCategory);
    // productCard.setAttribute('data-id', Date.now()); // Use timestamp as unique ID

    // productCard.innerHTML = `
    //     <div class="product-details">
    //         <h3>${formData.get('name')}</h3>
    //         <p class="price">$ ${formData.get('price')}</p>
    //         <p class="size">Size: ${formData.get('size')}</p>
    //         <p class="description">${formData.get('description')}</p>
    //         <div class="admin-actions">
    //             <button class="edit-btn" onclick="editProduct(this)">
    //                 <i class="fas fa-edit"></i> Edit
    //             </button>
    //             <button class="delete-btn" onclick="deleteProduct(this)">
    //                 <i class="fas fa-trash"></i> Delete
    //             </button>
    //         </div>
    //     </div>
    // `;

    // // Add the new card to the grid
    // productsGrid.appendChild(productCard);

    // // Prepare product data for API submission



    const productData = {
        name: formData.get('name'),
        price: formData.get('price'),
        size: formData.get('size'),
        description: formData.get('description'),
        type: activeCategory,
        ImagesUrl: ImagesUrl,

    };

    console.log(productData)
    // Send product data to the server
    try {
        const response = await fetch('http://localhost:3000/api/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Product added successfully:', result);
        } else {
            const error = await response.json();
            console.error('Failed to add product:', error);
        }
    } catch (error) {
        console.error('Network or server error:', error);
    }
}

async function deleteProduct(productId) {


    try {
        const response = await fetch(`http://localhost:3000/api/delete-product/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            console.error(`Failed to delete product: ${response.status} ${response.statusText}`);
            return;
        }

        console.log(`Product with ID ${productId} deleted successfully`);

   
    } catch (error) {
        console.error('Error deleting the product:', error);
    }
}



// Add event listeners to category buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
        // Remove active class from all buttons
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        event.target.classList.add('active');

        // Get the selected category
        const selectedCategory = event.target.dataset.category;

        // Fetch and display products for the selected category
        await getAllProducts(selectedCategory);
    });
});

async function getAllProducts(selectedCategory = 'men') {
    try {
        const response = await fetch("http://localhost:3000/api/products");

        if (!response.ok) {
            console.error(`Failed to fetch products: ${response.status} ${response.statusText}`);
            return;
        }

        const jsonData = await response.json();

        if (jsonData.products && Array.isArray(jsonData.products)) {
            const panel = document.getElementById("products-section2");

            if (!panel) {
                console.error("Element with ID 'products-section2' not found.");
                return;
            }

            panel.innerHTML = '';

            const filteredProducts = selectedCategory === 'all'
                ? jsonData.products
                : jsonData.products.filter(product => product.type.toLowerCase() === selectedCategory.toLowerCase());

            if (filteredProducts.length === 0) {
                panel.innerHTML = `<p>No products found for the selected category.</p>`;
                return;
            }

            filteredProducts.forEach(product => {
                const child = document.createElement('div');
                child.className = 'product-card';
                child.id = `product-${product.id}`; 

                child.innerHTML = `
                    <h2 class="item-name">Name: ${product.name}</h2>
                    <h2 class="item-size">Size: ${product.size || 'N/A'}</h2>
                    <h2 class="item-price">Price: $${product.price}</h2>
                    <h2 class="item-type">Type: ${product.type || 'N/A'}</h2>
                `;

                // Add Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button';
                deleteButton.addEventListener('click', () => {
                    deleteProduct(product.id);
                });

                // Add Edit button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-button';
                editButton.addEventListener('click', () => {
                    openEditPopup(product);
                });

                child.appendChild(deleteButton);
                child.appendChild(editButton);
                panel.appendChild(child);
            });
        } else {
            console.error("Unexpected response structure:", jsonData);
        }
    } catch (error) {
        console.error("Error fetching or displaying products:", error);
    }
}

// Function to open edit popup
function openEditPopup(product) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'popup-container';

    // Popup content
    popup.innerHTML = `
        <div class="popup-content">
            <h3>Edit Product</h3>
            <label>Name:</label>
            <input type="text" id="edit-name" value="${product.name}" />
            <label>Size:</label>
            <input type="text" id="edit-size" value="${product.size || ''}" />
            <label>Price:</label>
            <input type="number" id="edit-price" value="${product.price}" />
            <label>Type:</label>
            <input type="text" id="edit-type" value="${product.type || ''}" />
            <button id="save-button">Save</button>
            <button id="cancel-button">Cancel</button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('cancel-button').addEventListener('click', () => {
        document.body.removeChild(popup);
    });

    // Save button to update the product
    document.getElementById('save-button').addEventListener('click', async () => {
        const updatedProduct = {
            id: product.id,
            name: document.getElementById('edit-name').value,
            size: document.getElementById('edit-size').value,
            price: parseFloat(document.getElementById('edit-price').value),
            type: document.getElementById('edit-type').value
        };

        await updateProduct(updatedProduct);
        document.body.removeChild(popup); 
        getAllProducts(); 
    });
}


async function updateProduct(product) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            console.error(`Failed to update product: ${response.status} ${response.statusText}`);
        } else {
            console.log('Product updated successfully.');
        }
    } catch (error) {
        console.error('Error updating product:', error);
    }
}


getAllProducts();



    
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
    
     // Reset the form after submission
});


// Function to restore products from localStorage
function restoreProductCards() {
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    const savedCards = localStorage.getItem(`productCards_${activeCategory}`);
    
    if (savedCards) {
        const productsData = JSON.parse(savedCards);
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = 'qweqwe';

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
// function updateProduct(productId, formData) {
//     const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
//     if (productCard) {
//         productCard.querySelector('h3').textContent = formData.get('name');
//         productCard.querySelector('.price').textContent = `$ ${formData.get('price')}`;
//         productCard.querySelector('.size').textContent = `Size: ${formData.get('size')}`;
//         productCard.querySelector('.description').textContent = formData.get('description');
        
//         // Save updated product to localStorage
//         saveProductCards();
//     }
// } 