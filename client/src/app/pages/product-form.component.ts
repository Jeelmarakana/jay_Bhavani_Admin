import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
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

        @if (isEditing && product) {
          <input type="hidden" formControlName="id">
        }

        <div class="field">
          <label>Product name <span>*</span>
            <input formControlName="name" autocomplete="product" required>
            <small *ngIf="f['name'].touched && f['name'].invalid">{{ fieldError('name') }}</small>
          </label>
        </div>

        <div class="field">
          <label>Category <span class="optional">(optional)</span>
            <input formControlName="category" autocomplete="category" placeholder="e.g. Necklaces, Earrings">
          </label>
        </div>

        <div class="field">
          <label>Price (₹) <span>*</span>
            <input formControlName="price" type="number" min="1" required>
            <small *ngIf="f['price'].touched && f['price'].invalid">{{ fieldError('price') }}</small>
          </label>
        </div>

        <div class="field">
          <label>Description <span class="optional">(optional)</span>
            <textarea formControlName="description" rows="3" placeholder="Describe the product..."></textarea>
          </label>
        </div>

        <div class="field">
          <label>Reference image <span class="optional">(optional)</span></label>
          <div class="upload-container">
            <span class="upload-icon">＋</span>
            <span>
              <strong>Add/change image</strong>
              <small>JPG, PNG, WebP · up to 5 MB</small>
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" (change)="chooseImage($event)" style="display:none">
            @if (previewUrl) {
              <div class="preview">
                <img [src]="previewUrl" alt="Product preview">
                <span>{{ imageName }}</span>
                <button type="button" class="text-button small" (click)="removeImage()">Remove</button>
              </div>
            }
          </div>
        </div>

        <button class="button" type="submit" [disabled]="loading || form.invalid">{{ loading ? 'Saving...' : 'Save product' }} <span aria-hidden="true">→</span></button>
      </form>
    </section>
  `
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);
  private readonly router = inject(Router);
  isEditing = false;
  product: Product | null = null;
  loading = false;
  success = false;
  error = '';
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['', [Validators.maxLength(80)]],
    price: ['', [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(2000)]]
  });
  image: File | null = null;
  previewUrl = '';
  imageName = '';

  get f() { return this.form.controls; }

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { product?: Product; isEditing?: boolean } | null;
    this.isEditing = state?.isEditing ?? false;
    this.product = state?.product ?? null;

    if (this.product) {
      this.form.patchValue({
        name: this.product.name,
        category: this.product.category,
        price: this.product.price,
        description: this.product.description
      });
    }
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
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = '';
    this.imageName = '';
    this.image = null;
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;
    this.success = false;

    const formData = new FormData();
    formData.append('name', this.form.value.name ?? '');
    formData.append('category', this.form.value.category ?? '');
    formData.append('price', this.form.value.price ?? '0');
    formData.append('description', this.form.value.description ?? '');
    if (this.image) formData.append('image', this.image);

    this.service.update(this.product?._id ?? '', formData).subscribe({
      next: (product) => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigateByUrl('/admin/products'), 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not save product.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.onSubmit();
  }
}