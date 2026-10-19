import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../core/product.service';
import { InquiryService } from '../core/inquiry.service';
import { Inquiry } from '../core/models';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="admin-page">
      <div class="page-heading"><div><span class="eyebrow">IMAGE GALLERY</span><h1>Client Uploaded Images</h1></div></div>

      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }

      <section class="card">
        <div class="table-scroll">
          <table>
            <thead><tr><th>IMAGE</th><th>INQUIRY</th><th>CLIENT</th><th>UPLOADED</th><th></th></tr></thead>
            <tbody>
              @for (item of galleryItems; track item._id) {
                <tr>
                  <td>
                    @if (item.imageUrl) {
                      <img [src]="item.imageUrl" alt="Client uploaded" style="max-width:80px;max-height:80px;object-fit:cover;border-radius:4px">
                    } @else { <span>No image</span> }
                  </td>
                  <td>{{ item.productName || '—' }}</td>
                  <td>{{ item.clientName || '—' }}</td>
                  <td>{{ item.createdAt | date:'short' }}</td>
                  <td>
                    <button class="text-button danger-text small" (click)="delete(item._id)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      @if (galleryItems.length === 0) { <p class="empty-state">No uploaded images yet.</p> }
    </section>
  `
})
export class ImageGalleryComponent {
  private readonly service = inject(InquiryService);
  private readonly inquiryService = inject(ProductService);
  galleryItems: Array<{ _id: string; imageUrl: string; productName: string; clientName: string; createdAt: string }> = [];
  error = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.service.list(1, '', '', '', '').subscribe({
      next: (page) => {
        this.galleryItems = page.items.map((item: any) => ({
          _id: item._id,
          imageUrl: item.referenceImageName ? `/uploads/${item.referenceImageName}` : '',
          productName: item.productName,
          clientName: item.clientName,
          createdAt: item.createdAt
        }));
      },
      error: (error: Error) => this.error = error.message || 'Could not load images.'
    });
  }

  delete(id: string): void {
    if (!window.confirm('Delete this inquiry and its uploaded image? This cannot be undone.')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (error: Error) => this.error = error.message || 'Could not delete inquiry.'
    });
  }
}