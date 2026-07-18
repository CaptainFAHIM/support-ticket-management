import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

/**
 * ProductsController
 *
 * Manages products in the SaaS platform.
 *
 * TODO:
 *  - POST   /products         → create product  (Admin only)
 *  - GET    /products         → list products   (Admin, Manager)
 *  - GET    /products/:id     → get product     (all authenticated)
 *  - PATCH  /products/:id     → update product  (Admin only)
 *  - DELETE /products/:id     → deactivate      (Admin only)
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Endpoints to be implemented
}
