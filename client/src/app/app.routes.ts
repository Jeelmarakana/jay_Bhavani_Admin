import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AdminLoginComponent } from './pages/admin-login.component';
import { AdminLayoutComponent } from './pages/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { InquiryListComponent } from './pages/inquiry-list.component';
import { InquiryDetailComponent } from './pages/inquiry-detail.component';
import { PublicInquiryComponent } from './pages/public-inquiry.component';
import { ProductListComponent } from './pages/product-list.component';
import { ProductFormComponent } from './pages/product-form.component';
import { ImageGalleryComponent } from './pages/image-gallery.component';

export const routes: Routes = [
  { path: '', component: PublicInquiryComponent, title: 'Product inquiry | Jay Bhavani Ornaments' },
  { path: 'admin/login', component: AdminLoginComponent, title: 'Admin login' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent, title: 'Admin dashboard' },
      { path: 'inquiries', component: InquiryListComponent, title: 'Client inquiries' },
      { path: 'inquiries/:id', component: InquiryDetailComponent, title: 'Inquiry details' },
      { path: 'products', component: ProductListComponent, title: 'Products management' },
      { path: 'products/new', component: ProductFormComponent, title: 'Add product' },
      { path: 'products/:id/edit', component: ProductFormComponent, title: 'Edit product' },
      { path: 'images', component: ImageGalleryComponent, title: 'Image gallery' }
    ]
  },
  { path: '**', redirectTo: '' }
];