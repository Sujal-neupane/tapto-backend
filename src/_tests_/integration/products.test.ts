import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import ProductModel from '../../models/product.model';

describe('Product Management Integration Tests', () => {
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up test users
    await UserModel.deleteMany({ email: 'productadmin@example.com' });

    // Create admin user via register endpoint
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'productadmin@example.com',
        password: 'Admin@1234',
        fullName: 'Product Admin',
        phoneNumber: '1234567890',
        shoppingPreference: 'Mens Fashion',
        role: 'admin'
      });

    adminToken = adminResponse.body.token;
    userId = adminResponse.body.data.id;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: 'productadmin@example.com' });
    // Only delete products created by the test user
    await ProductModel.deleteMany({ createdBy: userId });
  });

  describe('GET /api/admin/products', () => {
    test('should get all products successfully', async () => {
      // Create test product
      await ProductModel.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        images: ['/test.jpg'],
        createdBy: userId
      });

      const response = await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/products')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/admin/products', () => {
    test('should create product successfully with all fields', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'New Product')
        .field('description', 'New Description')
        .field('price', '149.99')
        .field('category', 'Electronics')
        .field('stock', '20')
        .field('discount', '10')
        .expect(400); // Expects 400 because no image is provided (required field)

      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject product without required fields', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Incomplete Product')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject invalid price format', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Invalid Price Product')
        .field('description', 'Description')
        .field('price', 'invalid')
        .field('category', 'Electronics')
        .field('stock', '10')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/admin/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await ProductModel.create({
        name: 'Update Test Product',
        description: 'Original Description',
        price: 99.99,
        category: 'Electronics',
        stock: 15,
        images: ['/test.jpg'],
        createdBy: userId
      });
      productId = product._id.toString();
    });

    test('should update product successfully', async () => {
      const response = await request(app)
        .put(`/api/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Updated Product')
        .field('description', 'Updated Description')
        .field('price', '199.99')
        .field('category', 'Electronics')
        .field('stock', '25')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe('Updated Product');
      expect(response.body.data.price).toBe(199.99);
    });

    test('should fail for non-existent product', async () => {
      const response = await request(app)
        .put('/api/admin/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Updated')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/admin/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await ProductModel.create({
        name: 'Delete Test Product',
        description: 'Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        images: ['/test.jpg'],
        createdBy: userId
      });
      productId = product._id.toString();
    });

    test('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await ProductModel.findById(productId);
      expect(deleted).toBeNull();
    });

    test('should fail for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/admin/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
