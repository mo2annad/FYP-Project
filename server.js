const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;


const app = express();
const prisma = new PrismaClient();

app.use(cors());





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
        const { id } = req.params; // Get the product ID from the request params
        const { name, price, size, type, description } = req.body; // Extract updated details from the request body

        // Validate input data
        if (!id || !name || !price || !type) {
            return res.status(400).json({ error: 'Product ID, name, price, and type are required.' });
        }

        // Parse ID and price to ensure valid data types
        const productId = parseInt(id);
        const productPrice = parseFloat(price);

        // Update the product in the database
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                price: productPrice,
                size,
                type,
                description,
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
      console.log("done")
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
  



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




