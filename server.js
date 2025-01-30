const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const nodemailer = require("nodemailer");


const app = express();
const prisma = new PrismaClient();

app.use(cors());

const checkoutEmailTemplate = (userName) => `
  <h1>Thank you for your order, ${userName}!</h1>
  <p>Your order has been successfully processed and is being prepared for shipment.</p>
  <p>We will notify you once your order has been shipped.</p>
  <p>Thank you for shopping with us!</p>
`;

const shippedEmailTemplate = (userName, trackingNumber) => `
  <h1>Your order has been shipped, ${userName}!</h1>
  <p>Your order is on its way. Here is your tracking number: <strong>${trackingNumber}</strong>.</p>
  <p>You can track your order using the following link: <a href="https://www.example.com/track">Track Order</a>.</p>
  <p>Thank you for shopping with us!</p>
`;

const deliveredEmailTemplate = (userName) => `
  <h1>Your order has been delivered, ${userName}!</h1>
  <p>We hope you enjoy your purchase. If you have any questions or need assistance, please contact us.</p>
  <p>Thank you for shopping with us!</p>
`;

// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ramikhairi13@gmail.com",
    pass: "buhq bsib wcpe gawf", 
  },
});

// Function to send checkout email
const sendCheckoutEmail = async (to, userName) => {
  const mailOptions = {
    from: "ramikhairi13@gmail.com",
    to,
    subject: "Order Confirmation - Thank You for Your Purchase!",
    html: checkoutEmailTemplate(userName),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Checkout email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending checkout email:", error);
    throw error;
  }
};

// Function to send shipped email
const sendShippedEmail = async (to, userName, trackingNumber) => {
  const mailOptions = {
    from: "ramikhairi13@gmail.com",
    to,
    subject: "Your Order Has Been Shipped!",
    html: shippedEmailTemplate(userName, trackingNumber),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Shipped email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending shipped email:", error);
    throw error;
  }
};

// Function to send delivered email
const sendDeliveredEmail = async (to, userName) => {
  const mailOptions = {
    from: "ramikhairi13@gmail.com",
    to,
    subject: "Your Order Has Been Delivered!",
    html: deliveredEmailTemplate(userName),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Delivered email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending delivered email:", error);
    throw error;
  }
};



app.use(express.json());
app.use(express.static('public'));

// Configure Cloudinary
cloudinary.config({
    api_key: "834279673859948",
    api_secret: "u4XDFgA8m9tEpg_JccwO2J5rW4o",
    cloud_name: "deqffek3i",
    secure: true
  });


  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      const fileTypes = /jpeg|jpg|png|gif/;
      const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimeType = fileTypes.test(file.mimetype);
  
      if (extName && mimeType) {
        return cb(null, true);
      } else {
        cb(new Error('Only images are allowed!'));
      }
    }
  });

  app.post("/send-checkout-email", async (req, res) => {
    const { to, userName } = req.body;
  
    if (!to || !userName) {
      return res.status(400).json({ error: "All fields (to, userName) are required." });
    }
  
    try {
      const info = await sendCheckoutEmail(to, userName);
      res.status(200).json({ message: "Checkout email sent successfully!", info });
    } catch (error) {
      res.status(500).json({ error: "Failed to send checkout email." });
    }
  });
  
  // Endpoint for shipped email
  app.post("/send-shipped-email", async (req, res) => {
    const { to, userName, trackingNumber } = req.body;
  
    if (!to || !userName || !trackingNumber) {
      return res.status(400).json({ error: "All fields (to, userName, trackingNumber) are required." });
    }
  
    try {
      const info = await sendShippedEmail(to, userName, trackingNumber);
      res.status(200).json({ message: "Shipped email sent successfully!", info });
    } catch (error) {
      res.status(500).json({ error: "Failed to send shipped email." });
    }
  });
  
  // Endpoint for delivered email
  app.post("/send-delivered-email", async (req, res) => {
    const { to, userName } = req.body;
  
    if (!to || !userName) {
      return res.status(400).json({ error: "All fields (to, userName) are required." });
    }
  
    try {
      const info = await sendDeliveredEmail(to, userName);
      res.status(200).json({ message: "Delivered email sent successfully!", info });
    } catch (error) {
      res.status(500).json({ error: "Failed to send delivered email." });
    }
  });

// API to handle adding a product
app.post('/api/add-product', async (req, res) => {
    try {
        const { name, price, size, description, type, ImagesUrl } = req.body;

        // Validate input data
        if (!name || !price || !description || !type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        

        const newProduct = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price), 
                size,
                description,
                type,
                images:ImagesUrl
            },
        });

        res.status(201).json({ success: true,
             product: newProduct 
            });
             
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});


app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { isDeleted: true },
        });

        res.status(200).json({ success: true, message: 'Product marked as deleted successfully', product: updatedProduct });
    } catch (error) {
        console.error('Error marking product as deleted:', error);
        res.status(500).json({ error: 'Failed to mark product as deleted' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, price, size, type, description, ImagesUrl } = req.body; // Extract updated details from the request body

        // Validate input data
        if (!id || !name || !price || !type) {
            return res.status(400).json({ error: 'Product ID, name, price, and type are required.' });
        }

        // Parse ID and price to ensure valid data types
        const productId = parseInt(id);
        const productPrice = parseFloat(price);
console.log(ImagesUrl)
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                price: productPrice,
                size,
                type,
                description,
                images:ImagesUrl
            },
        });

        res.status(200).json({ success: true, product: updatedProduct }); // Return updated product
    } catch (error) {
        console.error('Error updating product:', error);

        // Handle specific Prisma errors (optional)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(500).json({ error: 'Failed to update product.' });
    }
});



app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }
    const imageUrl = `/img/products/${req.file.filename}`;
    res.json({ imageUrl });
});

// Handle page updates
app.post('/api/update-page', async (req, res) => {
    try {
        const { filename, content } = req.body;
        
        // Validate filename to prevent directory traversal
        const safePath = path.join(__dirname, 'public', filename);
        if (!safePath.startsWith(path.join(__dirname, 'public'))) {
            return res.status(403).json({ error: 'Invalid file path' });
        }

        // Write the updated content to the file
        await fs.writeFile(safePath, content, 'utf8');
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Failed to update file' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { id, name, email } = req.body;

        // Validate the input
        if (!id || !email) {
            return res.status(400).json({ error: 'ID and email are required.' });
        }

        // Create the new user
        const newUser = await prisma.user.create({
            data: {
                id,        // Manually assigned ID
                name,      // Optional name
                email,     // Required email
            },
        });

        res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);

        // Check for unique constraint violation on email
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        res.status(500).json({ error: 'Failed to create user.' });
    }
});



app.get('/api/products', async (req, res) => {
    try {
        const { type } = req.query; // Retrieve the type filter from query parameters
        const products = await prisma.product.findMany({
            where: {
                isDeleted: false, 
                ...(type && { type }), 
            },
            select: {
                id: true,
                name: true,
                price: true,
                size: true,
                description: true,
                type: true,
                images:true
            },
            orderBy: {
                id: 'desc', // Order by descending ID
            },
        });

        res.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params; // Retrieve the product ID from the URL parameters

        // Fetch the product details using Prisma
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }, 
            select: {
                id: true,
                name: true,
                price: true,
                size: true,
                description: true,
                type: true,
                images: true, 
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product); // Return the product details as a JSON response
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});



app.get('/api/orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch orders for the specific user
        const orders = await prisma.order.findMany({
            where: {
                userId: userId, // Filter by userId
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                description: true,
                                type: true,
                                size: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Sort by most recent orders
            },
        });
        res.json({ orders });
    } catch (error) {
        console.error('Error fetching orders for user:', error);
        res.status(500).json({ error: 'Failed to fetch orders for user' });
    }
});



app.get('/api/orders', async (req, res) => {
    try {
        // Fetch all orders
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                description: true,
                                type: true,
                                size: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Sort by most recent orders
            },
        });

        res.json({ orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
});

app.get('/api/users2', async (req, res) => {
    try {
        // Fetch all users with their orders and related product details
        const users = await prisma.user.findMany({
            include: {
                orders: {
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                        description: true,
                                        type: true,
                                        size: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Sort by most recent users
            },
        });

        res.json({ users });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ error: 'Failed to fetch all users' });
    }
});

app.post('/api/place-order', async (req, res) => {
    try {


        const { userId, items } = req.body; 

        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const { productId, quantity } = item;

            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid productId or quantity' });
            }

            const product = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                return res.status(404).json({ error: `Product with id ${productId} not found` });
            }

            const itemPrice = product.price * quantity;
            totalPrice += itemPrice;

            orderItems.push({
                productId,
                quantity,
                price: itemPrice,
            });
        }

        const order = await prisma.order.create({
            data: {
                userId,
                totalPrice,
                orderItems: {
                    create: orderItems,
                },
            },
            include: {
                orderItems: true,
            },
        });

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});




app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; 

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json({ order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});


app.post('/api/reviews', async (req, res) => {
    const { rating, comment, productId, userId } = req.body;

    if (!rating || !comment || !productId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                productId,
                userId,
            },
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

app.get('/api/reviews/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            include: {
                user: {
                    select: {
                        name: true, // Get user name for the review
                    },
                },
            },
        });

        res.json({ reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});


const uploadToCloudinary = async (imagePath) => {
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true
    };
  
    try {
      const result = await cloudinary.uploader.upload(imagePath, options);
      return result.secure_url; 
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };
  
  app.post('/upload-multiple', upload.array('image', 5), async (req, res) => {
    try {
      const uploadedFiles = req.files; 
      const cloudinaryUrls = [];
  
  
  
      for (const file of uploadedFiles) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        cloudinaryUrls.push(cloudinaryUrl);
      }
      res.status(200).json({
        message: 'Files uploaded successfully to Cloudinary!',
        urls: cloudinaryUrls
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading files to Cloudinary!',
        error: error.message
      });
    }
  });
  



  app.post("/send-email", async (req, res) => {
    const { to, subject, text } = req.body;
  



    
    if (!to || !subject || !text) {
      return res.status(400).json({ error: "All fields (to, subject, text) are required." });
    }
  
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", 
        auth: {
          user: "ramikhairi13@gmail.com", 
          pass: "buhq bsib wcpe gawf",
        },
      });
  
      const mailOptions = {
        from: "ramikhairi13@gmail.com", 
        to,
        subject,
        text,
      };
  
      const info = await transporter.sendMail(mailOptions);
  
      res.status(200).json({
        message: "Email sent successfully!",
        info,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });
  



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




