async function placeOrder(orderItems) {
    const currentUserId = localStorage.getItem("currentUserId"); 

    if (!currentUserId) {
      console.error("No user is signed in. Cannot place order.");
      return;
    }
  
    const orderData = {
      userId: currentUserId,
      items: orderItems,
    };

    console.log(orderData)
  
    try {
      const response = await fetch("http://localhost:3000/api/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      const data = await response.json();
  
      



      if (response.ok) {
        console.log("Order placed successfully:", data);
      } else {
        console.error("Error placing order:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  



 