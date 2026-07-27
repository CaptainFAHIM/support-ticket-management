// Fahim
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

/**
 * ProductsController
 *
 * Admin manages products (create, update, delete).
 * All authenticated users can read products.
 */
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Admin-only write endpoints ──────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiBody({ type: CreateProductDto })
  @Roles(Role.Admin)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    try {
      return await this.productsService.createProduct(dto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not create product' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Update a product name (Admin only)' })
  @ApiBody({ type: UpdateProductDto })
  @Roles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    try {
      return await this.productsService.updateProduct(id, dto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not update product' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.productsService.deleteProduct(id);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not delete product' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ── Read endpoints — accessible to all authenticated roles ─────────────────

  @ApiOperation({ summary: 'List all products' })
  @Get()
  async findAll() {
    try {
      return await this.productsService.findAll();
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Could not fetch products' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get a single product by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.NOT_FOUND, error: error.message || 'Product not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
