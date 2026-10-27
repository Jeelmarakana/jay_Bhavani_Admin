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
      <div class="page-heading">
        <div>
          <span class="eyebrow">PRODUCTS</span>
          <h1>Manage Products</h1>
          <p>Add, edit or remove jewellery catalog products.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <a class="button button-outline button-small" routerLink="/" target="_blank">🌐 View Client Website</a>
          <a class="button button-small" routerLink="/admin/products/new">+ Add Product</a>
        </div>
      </div>
      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      <section class="card">
        <div class="table-scroll">
          <table>
            <thead><tr><th>IMAGE</th><th>NAME</th><th>CATEGORY</th><th>PRICE</th><th>ACTIONS</th></tr></thead>
            <tbody>
              @for (product of products; track product._id) {
                <tr>
                  <td>
                    @if (product.image || (product.images && product.images.length)) {
                      <img [src]="'http://localhost:3000/uploads/' + (product.image || product.images![0])" alt="{{ product.name }}" width="48" height="48" style="object-fit:cover;border-radius:6px;border:1px solid #e0d5c8;display:block;">
                    } @else {
                      <div style="width:48px;height:48px;background:#f5efe6;border-radius:6px;display:grid;place-items:center;color:var(--muted);font-size:10px;">No img</div>
                    }
                  </td>
                  <td><strong>{{ product.name }}</strong></td>
                  <td>{{ product.category || '-' }}</td>
                  <td><strong style="color:var(--gold-dark);font-size:14px;">₹{{ product.price }}</strong></td>
                  <td>
                    <a class="text-link" [routerLink]="['/admin/products', product._id, 'edit']">Edit →</a>
                    <button class="text-button danger-text" style="margin-left: 10px;" (click)="delete(product._id)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      @if (products.length === 0 && !error) {
        <p class="empty-state">No products found. <a routerLink="/admin/products/new">Add your first product.</a></p>
      }
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