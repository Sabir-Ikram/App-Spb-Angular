import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SearchComponent } from './user/search/search.component';
import { BookingComponent } from './booking/booking.component';
import { UserDashboardComponent } from './user/dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'booking', component: BookingComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
