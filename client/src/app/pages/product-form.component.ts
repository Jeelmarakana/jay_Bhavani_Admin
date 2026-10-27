import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../core/product.service';
import { Product } from '../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="admin-page">
      <div class="page-heading">
        <div>
          <span class="eyebrow">{{ isEditing ? 'EDIT' : 'ADD' }} PRODUCT</span>
          <h1>{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h1>
        </div>
        <a class="button button-small" [routerLink]="['/admin/products']">← Back to list</a>
      </div>

      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      @if (saved) { <div class="notice success" role="status">Product saved successfully.</div> }

      <form [formGroup]="form" (ngSubmit)="submit()" class="product-form">
        <div class="field">
          <label>Product name <span>*</span>
            <input formControlName="name" autocomplete="off" placeholder="e.g. Traditional Gold Necklace" required>
            @if (f.name.touched && f.name.invalid) {
              <small class="error-text">{{ fieldError('name') }}</small>
            }
          </label>
        </div>

        <div class="field">
          <label>Category <span class="optional">(optional)</span>
            <input formControlName="category" placeholder="e.g. Necklaces, Bangles, Rings">
          </label>
        </div>

        <div class="field">
          <label>Price (₹) <span>*</span>
            <input formControlName="price" type="number" min="1" placeholder="e.g. 45000" required>
            @if (f.price.touched && f.price.invalid) {
              <small class="error-text">{{ fieldError('price') }}</small>
            }
          </label>
        </div>

        <div class="field">
          <label>Description <span class="optional">(optional)</span>
            <textarea formControlName="description" rows="3" placeholder="Describe the jewellery item..."></textarea>
          </label>
        </div>

        <div class="field">
          <label>Product image <span class="optional">(optional)</span></label>
          <div class="upload-container">
            <span class="upload-icon">＋</span>
            <label style="cursor: pointer; display: inline-block;">
              <strong>Choose Image</strong>
              <small> JPG, PNG, WebP · up to 5 MB</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" (change)="chooseImage($event)" style="display:none">
            </label>
            @if (previewUrl) {
              <div class="preview" style="margin-top: 10px;">
                <img [src]="previewUrl" alt="Product preview" style="max-height: 120px; border-radius: 4px;">
                <span style="display: block; font-size: 12px; margin-top: 4px;">{{ imageName }}</span>
                <button type="button" class="text-button small" (click)="removeImage()">Remove</button>
              </div>
            }
          </div>
        </div>

        <button class="button" type="submit" [disabled]="loading || form.invalid">
          {{ loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product') }} <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  `
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEditing = false;
  productId = '';
  loading = false;
  saved = false;
  error = '';
  image: File | null = null;
  previewUrl = '';
  imageName = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['', [Validators.maxLength(80)]],
    price: ['', [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(2000)]]
  });

  get f() { return this.form.controls; }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.productId = id;
      this.service.get(id).subscribe({
        next: (product) => {
          this.form.patchValue({
            name: product.name,
            category: product.category,
            price: String(product.price),
            description: product.description
          });
          const img = product.image || (product.images && product.images.length ? product.images[0] : '');
          if (img) {
            this.previewUrl = `http://localhost:3000/uploads/${img}`;
            this.imageName = img;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Could not load product details.';
        }
      });
    }
  }

  fieldError(name: 'name' | 'price'): string {
    const control = this.form.controls[name];
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('min')) return 'Price must be greater than 0.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  chooseImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error = 'Choose a JPG, PNG, or WebP image smaller than 5 MB.';
      input.value = '';
      return;
    }
    this.removeImage();
    this.image = file;
    this.imageName = file.name;
    this.previewUrl = URL.createObjectURL(file);
    this.error = '';
  }

  removeImage(): void {
    if (this.previewUrl && !this.previewUrl.startsWith('http')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = '';
    this.imageName = '';
    this.image = null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.loading = true;
    this.saved = false;

    const formData = new FormData();
    formData.append('name', this.form.value.name ?? '');
    formData.append('category', this.form.value.category ?? '');
    formData.append('price', this.form.value.price ?? '0');
    formData.append('description', this.form.value.description ?? '');
    if (this.image) formData.append('image', this.image);

    const request$ = this.isEditing && this.productId
      ? this.service.update(this.productId, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.saved = true;
        setTimeout(() => this.router.navigateByUrl('/admin/products'), 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not save product.';
      }
    });
  }
}