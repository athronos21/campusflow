import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto, ProductQueryDto } from '@campusflow/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Catalog & Products')
@Controller('products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter active products in campus catalog' })
  async getProducts(@Query() query: ProductQueryDto) {
    const products = await this.catalogService.findProducts(query);
    return products.map((p) => ({
      ...p,
      priceMinor: Number(p.priceMinor),
    }));
  }

  @Post('business/:businessId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new product listing for a merchant' })
  async createProduct(
    @Param('businessId') businessId: string,
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.catalogService.createProduct(businessId, dto);
    return {
      ...product,
      priceMinor: Number(product.priceMinor),
    };
  }

  @Patch(':id/availability')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle product stock availability' })
  async toggleAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    const product = await this.catalogService.toggleAvailability(id, isAvailable);
    return {
      ...product,
      priceMinor: Number(product.priceMinor),
    };
  }
}
