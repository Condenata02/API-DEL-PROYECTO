const request = require('supertest');
const express = require('express');
const productRoutes = require('../../src/routes/products');

// Mock the Product model
jest.mock('../../src/models/Product', () => {
  const mockProduct = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn(),
  }));
  mockProduct.find = jest.fn();
  mockProduct.findById = jest.fn();
  mockProduct.findByIdAndUpdate = jest.fn();
  mockProduct.findByIdAndDelete = jest.fn();
  return mockProduct;
});

const Product = require('../../src/models/Product');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const mockProducts = [{ name: 'Product1' }, { name: 'Product2' }];
      Product.find.mockResolvedValue(mockProducts);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(Product.find).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      Product.find.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by id', async () => {
      const mockProduct = { _id: '123', name: 'Test Product' };
      Product.findById.mockResolvedValue(mockProduct);

      const response = await request(app).get('/api/products/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(Product.findById).toHaveBeenCalledWith('123');
    });

    it('should return 404 if product not found', async () => {
      Product.findById.mockResolvedValue(null);

      const response = await request(app).get('/api/products/123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 500 on error', async () => {
      Product.findById.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/products/123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const mockProductData = { name: 'New Product', price: 10.99, description: 'A new product' };
      const mockSavedProduct = { ...mockProductData, _id: '456' };
      Product.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockSavedProduct),
      }));

      const response = await request(app)
        .post('/api/products')
        .send(mockProductData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockSavedProduct);
      expect(Product).toHaveBeenCalledWith(mockProductData);
    });

    it('should return 400 on validation error', async () => {
      Product.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockRejectedValue(new Error('Validation error')),
      }));

      const response = await request(app)
        .post('/api/products')
        .send({ name: 'New Product', price: 10.99, description: 'A new product' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const mockUpdatedProduct = { _id: '123', name: 'Updated Product' };
      Product.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      const response = await request(app)
        .put('/api/products/123')
        .send({ name: 'Updated Product' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedProduct);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('123', { name: 'Updated Product' }, { new: true });
    });

    it('should return 404 if product not found', async () => {
      Product.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/products/123')
        .send({ name: 'Updated Product' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 400 on error', async () => {
      Product.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .put('/api/products/123')
        .send({ name: 'Updated Product' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const mockDeletedProduct = { _id: '123', name: 'Deleted Product' };
      Product.findByIdAndDelete.mockResolvedValue(mockDeletedProduct);

      const response = await request(app).delete('/api/products/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Product deleted');
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should return 404 if product not found', async () => {
      Product.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app).delete('/api/products/123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 500 on error', async () => {
      Product.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/api/products/123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
});