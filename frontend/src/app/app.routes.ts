import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { OrdersComponent } from './user/orders/orders.component'; 
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { ItemsComponent } from './user/items/items.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
  },
  { path: 'orders', 
    component: OrdersComponent,
    canActivate: [AuthGuard]
  },
  { path: 'items', 
    component: ItemsComponent, 
    canActivate: [AuthGuard] 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [
    FormsModule
  ]
})
export class AppModule { }