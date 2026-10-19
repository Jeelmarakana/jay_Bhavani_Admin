import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../core/product.service';
import { Product } from '../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="admin-page">
      <div class="page-heading"><div><span class="eyebrow">PRODUCTS</span><h1>Manage Products</h1></div></div>
      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      <section class="card">
        <div class="table-scroll">
          <table>
            <thead><tr><th>NAME</th><th>CATEGORY</th><th>PRICE</th><th>IMAGES</th><th></th></tr></thead>
            <tbody>
              @for (product of products; track product._id) {
                <tr>
                  <td><strong>{{ product.name }}</strong></td>
                  <td>{{ product.category || '-' }}</td>
                  <td>₹{{ product.price }}</td>
                  <td>
                    @if (product.images.length) {
                      <div class="small-preview">
                        @for (img of product.images; track $index) {
                          <img [src]="'/uploads/' + img" alt="{{ product.name }}" width="40" height="40" style="object-fit:cover;border-radius:4px;margin:2px">
                        }
                      </div>
                    } @else { <span style="color:var(--muted): no images</span> }
                  </td>
                  <td>
                    <a class="text-link" [routerLink]="['/admin/products', product._id]">Edit →</a>
                    <button class="text-button danger-text" (click)="delete(product._id)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      @if (products.length === 0) { <p class="empty-state">No products found. Add your first product.</p> }
    </section>
  `
})
export class ProductListComponent {
  private readonly service = inject(ProductService);
  products: Product[] = [];
  error = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (products) => this.products = products,
      error: (error: Error) => this.error = error.message || 'Could not load products.'
    });
  }

  delete(id: string): void {
    if (!window.confirm('Delete this product and its images? This cannot be undone.')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (error: Error) => this.error = error.message || 'Could not delete product.'
    });
  }
}