import mongoose from 'mongoose';
import { MONGODB_URI } from '../src/config';
import { UserModel } from '../src/models/user.model';
import ProductModel from '../src/models/product.model';
import bcrypt from 'bcryptjs';

const DUMMY_PRODUCTS = [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-quality noise-cancelling wireless headphones with 30-hour battery life',
    price: 299.99,
    category: 'Electronics',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Classic Running Shoes',
    description: 'Comfortable and durable running shoes with advanced cushioning technology',
    price: 129.99,
    category: 'Footwear',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Leather Messenger Bag',
    description: 'Stylish genuine leather messenger bag perfect for work and travel',
    price: 189.99,
    category: 'Accessories',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with fitness tracking, heart rate monitor, and 7-day battery',
    price: 249.99,
    category: 'Electronics',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1519824712712-d7246c50f6f9?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Cotton T-Shirt Collection',
    description: 'Premium 100% organic cotton t-shirts in various colors',
    price: 49.99,
    category: 'Clothing',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1629374040654-d2a6de6d24b8?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Denim Jeans',
    description: 'Classic blue denim jeans with comfortable fit and durable construction',
    price: 99.99,
    category: 'Clothing',
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Winter Wool Coat',
    description: 'Warm and stylish winter coat made from premium wool blend',
    price: 349.99,
    category: 'Outerwear',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1539533057440-7814a9755595?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1539533057440-7814a9755595?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Sunglasses UV Protection',
    description: 'Polarized sunglasses with 100% UV protection and stylish frame design',
    price: 149.99,
    category: 'Accessories',
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with cushioning and carrying strap',
    price: 69.99,
    category: 'Sports',
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop'
    ]
  },
  {
    name: 'Laptop Backpack',
    description: 'Durable backpack with laptop compartment and USB charging port',
    price: 119.99,
    category: 'Accessories',
    stock: 70,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1578042361785-cfeb529ffef3?w=500&h=500&fit=crop'
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create or get admin user
    let admin = await UserModel.findOne({ email: 'admin@tapto.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);
      admin = await UserModel.create({
        email: 'admin@tapto.com',
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'admin',
        phoneNumber: '+1234567890',
        shoppingPreference: 'All Categories'
      });
      console.log('✅ Created admin user');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample regular users
    const userEmails = ['user1@tapto.com', 'user2@tapto.com', 'user3@tapto.com'];
    for (const email of userEmails) {
      let user = await UserModel.findOne({ email });
      if (!user) {
        const hashedPassword = await bcrypt.hash('User@1234', 10);
        await UserModel.create({
          email,
          password: hashedPassword,
          fullName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          role: 'user',
          phoneNumber: '+9779' + Math.floor(Math.random() * 100000000),
          shoppingPreference: 'Fashion'
        });
        console.log(`✅ Created user: ${email}`);
      }
    }

    // Seed products
    for (const productData of DUMMY_PRODUCTS) {
      const existingProduct = await ProductModel.findOne({ name: productData.name });
      if (!existingProduct) {
        await ProductModel.create({
          ...productData,
          createdBy: admin._id
        });
        console.log(`✅ Created product: ${productData.name}`);
      } else {
        console.log(`⏭️  Product already exists: ${productData.name}`);
      }
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log(`📊 Total products: ${DUMMY_PRODUCTS.length}`);
    console.log('\n📝 Admin credentials:');
    console.log('   Email: admin@tapto.com');
    console.log('   Password: Admin@1234');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
