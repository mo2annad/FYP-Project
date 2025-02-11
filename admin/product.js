// Add event listeners to filter buttons for orders
document.querySelectorAll('.order-filter-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
        // Remove active class from all buttons
        document.querySelectorAll('.order-filter-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        event.target.classList.add('active');

        // Get the selected status
        const selectedStatus = event.target.dataset.status;

        // Fetch and display orders based on the selected status
        await getAllOrders(selectedStatus);
    });
});

window.changeOrderStatus = async function changeOrderStatus(orderId, newStatus, userEmail, userName) {
    if (newStatus === 'Delivered' || newStatus === 'Shipped') {
        const confirmation = confirm(`Are you sure you want to mark this order as ${newStatus}?`);
        if (!confirmation) return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            console.error(`Failed to update order status: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log(`Order status updated to ${newStatus}:`, data);

        // Send email notification
        await sendStatusUpdateEmail(userEmail, userName, newStatus);

        await getAllOrders(); // Refresh the order list
    } catch (error) {
        console.error('Error updating order status:', error);
    }
};

async function sendStatusUpdateEmail(email, userName, status) {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "to": email,
            "userName": userName,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        if(status === "Shipped") {
            const response = await fetch("http://localhost:3000/send-shipped-email", requestOptions);
            const result = await response.text();
            console.log(result);
        }
        else if(status === "Delivered") {
            const response = await fetch("http://localhost:3000/send-delivered-email", requestOptions);
            const result = await response.text();
            console.log(result);
        }
        
        
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

window.getAllOrders = async function getAllOrders(selectedStatus = 'all') {
    try {
        const response = await fetch("http://localhost:3000/api/orders");

        if (!response.ok) {
            console.error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
            return;
        }

        const jsonData = await response.json();

        if (jsonData.orders && Array.isArray(jsonData.orders)) {
            const ordersPanel = document.getElementById("orders-section");

            if (!ordersPanel) {
                console.error("Element with ID 'orders-section' not found.");
                return;
            }

            // Clear previous orders
            ordersPanel.innerHTML = '';

            // Filter orders by status if a specific status is selected
            const filteredOrders = selectedStatus === 'all'
                ? jsonData.orders
                : jsonData.orders.filter(order => order.status.toLowerCase() === selectedStatus.toLowerCase());

            // Display a message if no orders match the filter
            if (filteredOrders.length === 0) {
                ordersPanel.innerHTML = `<p>No orders found for the selected status.</p>`;
                return;
            }

            // Display each order
            filteredOrders.forEach(order => {
                const orderContainer = document.createElement('div');
                orderContainer.className = 'order-card';

                orderContainer.innerHTML = `
                <h3 class="order-id">Order ID: ${order.id} <span class="order-status">(${order.status})</span></h3>
                <p class="order-total"><strong>Total Price:</strong> $${order.totalPrice}</p>
                <p class="order-date"><strong>Ordered At:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p class="order-date"><strong>User Name:</strong> ${order.user.name}</p>
                <p class="order-date"><strong>User Email:</strong> ${order.user.email}</p>
                <div class="order-items">
                    ${order.orderItems.map(item => `
                        <div class="order-item-card">
                            <p class="product-name"><strong>Product:</strong> ${item.product.name}</p>
                            <p class="product-quantity"><strong>Quantity:</strong> ${item.quantity}</p>
                            <p class="product-subtotal"><strong>Subtotal:</strong> $${item.quantity * item.product.price}</p>
                        </div>
                        `).join('')}
                    
                    <!-- Status Buttons -->
                    <div class="status-buttons">
                        <button class="status-btn" onclick="changeOrderStatus(${order.id}, 'Pending', '${order.user.email}', '${order.user.name}')">Pending</button>
                        <button class="status-btn" onclick="changeOrderStatus(${order.id}, 'Processing', '${order.user.email}', '${order.user.name}')">Processing</button>
                        <button class="status-btn" onclick="changeOrderStatus(${order.id}, 'Shipped', '${order.user.email}', '${order.user.name}')">Shipped</button>
                        <button class="status-btn" onclick="changeOrderStatus(${order.id}, 'Delivered', '${order.user.email}', '${order.user.name}')">Delivered</button>
                        <button class="status-btn cancel-btn" onclick="changeOrderStatus(${order.id}, 'Canceled', '${order.user.email}', '${order.user.name}')">Cancel</button>
                    </div>
                </div>
            `;
                
                // Add Delete button to remove order
                const deleteOrderButton = document.createElement('button');
                deleteOrderButton.textContent = 'Delete Order';
                deleteOrderButton.className = 'delete-order-button';
                deleteOrderButton.addEventListener('click', () => {
                    deleteOrder(order.id);
                });

                ordersPanel.appendChild(orderContainer);
            });
        } else {
            console.error("Unexpected response structure:", jsonData);
        }
    } catch (error) {
        console.error("Error fetching or displaying orders:", error);
    }
}
