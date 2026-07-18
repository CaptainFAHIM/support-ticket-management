import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

/**
 * ProductsService
 *
 * Business logic for SaaS product management.
 *
 * TODO:
 *  - createProduct(dto)
 *  - findAll()            → list all products (optionally filter by isActive)
 *  - findOne(id)
 *  - updateProduct(id, dto)
 *  - deactivateProduct(id) → sets isActive = false
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  // Placeholder — full implementation coming next
}
