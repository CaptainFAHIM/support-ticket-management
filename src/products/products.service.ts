// Fahim
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product.
   * Throws ConflictException if a product with the same name already exists.
   */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productsRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `A product named "${dto.name}" already exists.`,
      );
    }
    const product = this.productsRepository.create(dto);
    return await this.productsRepository.save(product);
  }

  /**
   * Return all products ordered by newest first.
   */
  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Return a single product by ID.
   * Throws NotFoundException if it does not exist.
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found.`);
    }
    return product;
  }

  /**
   * Update a product's name.
   * Throws NotFoundException if the product does not exist.
   */
  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return await this.productsRepository.save(product);
  }

  /**
   * Hard-delete a product.
   * Throws NotFoundException if the product does not exist.
   */
  async deleteProduct(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
