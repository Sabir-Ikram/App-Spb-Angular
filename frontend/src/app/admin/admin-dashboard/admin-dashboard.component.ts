import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { ReservationService } from '../../services/reservation.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../auth/auth.service';
import { ReservationResponse, ReservationStatus, ReservationType } from '../../models/reservation.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatMenuModule
  ],
  template: `
    <div class="admin-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>
            <mat-icon class="hero-icon">admin_panel_settings</mat-icon>
            Admin Dashboard
          </h1>
          <p class="hero-subtitle">Manage reservations, import data, and monitor system activity</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-container">
        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-card">
          <mat-icon>error</mat-icon>
          <div>
            <h3>Access Denied</h3>
            <p>{{errorMessage}}</p>
          </div>
        </div>

        <div *ngIf="!errorMessage">
          <!-- Admin Actions Card -->
          <mat-card class="actions-card">
            <div class="card-header">
              <mat-icon>settings</mat-icon>
              <span>System Operations</span>
            </div>
            <div class="actions-grid">
              <button mat-raised-button color="accent" (click)="importDestinations()" [disabled]="importing" class="action-button">
                <mat-icon>{{importing ? 'sync' : 'download'}}</mat-icon>
                <span>{{importing ? 'Importing...' : 'Import Destinations'}}</span>
              </button>
              <button mat-raised-button color="primary" (click)="importFlights()" [disabled]="importingFlights" class="action-button">
                <mat-icon>{{importingFlights ? 'sync' : 'flight'}}</mat-icon>
                <span>{{importingFlights ? 'Importing...' : 'Import Flights'}}</span>
              </button>
              <button mat-raised-button color="warn" (click)="clearFlights()" [disabled]="clearingFlights" class="action-button">
                <mat-icon>{{clearingFlights ? 'sync' : 'delete_sweep'}}</mat-icon>
                <span>{{clearingFlights ? 'Clearing...' : 'Clear All Flights'}}</span>
              </button>
              <button mat-raised-button routerLink="/admin/reservations" class="action-button">
                <mat-icon>event_note</mat-icon>
                <span>Manage Reservations</span>
              </button>
            </div>
          </mat-card>

          <!-- Stats Cards -->
          <div class="stats-grid">
            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon total">confirmation_number</mat-icon>
                <div>
                  <div class="stat-value">{{reservations.length}}</div>
                  <div class="stat-label">Total Reservations</div>
                </div>
              </div>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon pending">schedule</mat-icon>
                <div>
                  <div class="stat-value">{{getStatusCount('PENDING')}}</div>
                  <div class="stat-label">Pending</div>
                </div>
              </div>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon confirmed">check_circle</mat-icon>
                <div>
                  <div class="stat-value">{{getStatusCount('CONFIRMED')}}</div>
                  <div class="stat-label">Confirmed</div>
                </div>
              </div>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon revenue">payments</mat-icon>
                <div>
                  <div class="stat-value">\${{getTotalRevenue()}}</div>
                  <div class="stat-label">Total Revenue</div>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Reservations Table Card -->
          <mat-card class="table-card">
            <div class="table-header">
              <div class="header-title">
                <mat-icon>list</mat-icon>
                <span>All Reservations</span>
                <span class="count-badge">{{filteredReservations.length}}</span>
              </div>
            </div>

            <!-- Search and Filters -->
            <div class="filters-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search</mat-label>
                <input matInput [(ngModel)]="searchText" (ngModelChange)="applyFilters()" placeholder="Search by ID or User">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="filterStatus" (selectionChange)="applyFilters()">
                  <mat-option value="ALL">All Status</mat-option>
                  <mat-option value="PENDING">Pending</mat-option>
                  <mat-option value="CONFIRMED">Confirmed</mat-option>
                  <mat-option value="CANCELLED">Cancelled</mat-option>
                  <mat-option value="COMPLETED">Completed</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="filterType" (selectionChange)="applyFilters()">
                  <mat-option value="ALL">All Types</mat-option>
                  <mat-option value="FLIGHT">Flight</mat-option>
                  <mat-option value="HOTEL">Hotel</mat-option>
                  <mat-option value="BOTH">Both</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-icon-button (click)="clearFilters()" matTooltip="Clear filters" class="clear-btn">
                <mat-icon>clear_all</mat-icon>
              </button>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="loading-state">
              <mat-spinner diameter="60"></mat-spinner>
              <p>Loading reservations...</p>
            </div>

            <!-- Table -->
            <div class="table-container" *ngIf="!loading">
              <table mat-table [dataSource]="paginatedReservations" class="reservations-table">
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>tag</mat-icon>
                      <span>ID</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <span class="id-badge">#{{r.id}}</span>
                  </td>
                </ng-container>

                <!-- User Column -->
                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>person</mat-icon>
                      <span>User ID</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <span class="user-id">{{r.userId}}</span>
                  </td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>category</mat-icon>
                      <span>Type</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <div class="type-chip">
                      <mat-icon>{{getTypeIcon(r.type)}}</mat-icon>
                      <span>{{getTypeLabel(r.type)}}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>info</mat-icon>
                      <span>Status</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <div [class]="'status-chip status-' + r.status.toLowerCase()">
                      <mat-icon>{{getStatusIcon(r.status)}}</mat-icon>
                      <span>{{r.status}}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Total Column -->
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>payments</mat-icon>
                      <span>Total</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <span class="price-value">\${{r.totalPrice}}</span>
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>schedule</mat-icon>
                      <span>Created</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <span class="date-value">{{r.createdAt | date:'short'}}</span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>
                    <div class="header-cell">
                      <mat-icon>more_vert</mat-icon>
                      <span>Actions</span>
                    </div>
                  </th>
                  <td mat-cell *matCellDef="let r">
                    <button mat-icon-button [matMenuTriggerFor]="menu" class="action-menu-btn">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>visibility</mat-icon>
                        <span>View Details</span>
                      </button>
                      <button mat-menu-item *ngIf="r.status === 'PENDING'">
                        <mat-icon>check_circle</mat-icon>
                        <span>Approve</span>
                      </button>
                      <button mat-menu-item *ngIf="r.status === 'PENDING' || r.status === 'CONFIRMED'">
                        <mat-icon color="warn">cancel</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
              </table>

              <!-- Empty State -->
              <div *ngIf="filteredReservations.length === 0" class="empty-state">
                <mat-icon>search_off</mat-icon>
                <h3>No Reservations Found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            </div>

            <!-- Pagination -->
            <mat-paginator
              *ngIf="!loading && filteredReservations.length > 0"
              [length]="filteredReservations.length"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8f6f3 0%, #fdfcfb 100%);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #d4722c 100%);
      padding: 80px 24px 60px;
      margin-bottom: 40px;
      box-shadow: 0 12px 48px rgba(139, 108, 80, 0.35);
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      animation: heroShimmer 3s ease-in-out infinite;
    }

    @keyframes heroShimmer {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      color: white;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 20px;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;
    }

    .hero-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      animation: iconFloat 3s ease-in-out infinite;
    }

    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }

    /* Content Container */
    .content-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 64px;
    }

    /* Error Card */
    .error-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 4px 16px rgba(244, 67, 54, 0.2);
      border-left: 4px solid #f44336;
    }

    .error-card mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }

    .error-card h3 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .error-card p {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0;
    }

    /* Actions Card */
    .actions-card {
      border-radius: 18px;
      margin-bottom: 32px;
      border: 2px solid rgba(139, 108, 80, 0.15);
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.12);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .actions-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(139, 108, 80, 0.18);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 1.35rem;
      font-weight: 700;
      color: #2d2416;
      padding: 28px 28px 20px;
      border-bottom: 3px solid rgba(139, 108, 80, 0.2);
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
    }

    .card-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #d4722c;
      background: rgba(212, 114, 44, 0.1);
      padding: 8px;
      border-radius: 12px;
    }

    .actions-grid {
      padding: 28px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      background: white;
    }

    .action-button {
      height: 60px !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: 14px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.03em !important;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .action-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .action-button:hover::before {
      left: 100%;
    }

    .action-button:hover:not([disabled]) {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
    }

    .action-button mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .action-button[disabled] mat-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 18px;
      border: 2px solid rgba(139, 108, 80, 0.15);
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      position: relative;
    }

    .stat-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.03) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px rgba(139, 108, 80, 0.18);
      border-color: #c4a574;
    }

    .stat-card:hover::after {
      opacity: 1;
    }

    .stat-content {
      padding: 28px;
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
    }

    .stat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      padding: 18px;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .stat-icon.total {
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      color: white;
    }

    .stat-icon.pending {
      background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
      color: white;
    }

    .stat-icon.confirmed {
      background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
      color: white;
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #d4722c 0%, #c45a1c 100%);
      color: white;
    }

    .stat-value {
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #d4722c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .stat-label {
      font-size: 0.95rem;
      color: #6d5d4b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Table Card */
    .table-card {
      border-radius: 18px;
      border: 2px solid rgba(139, 108, 80, 0.15);
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.12);
      overflow: hidden;
    }

    .table-header {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #d4722c 100%);
      padding: 28px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
    }

    .table-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      animation: headerShimmer 3s ease-in-out infinite;
    }

    @keyframes headerShimmer {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 18px;
      color: white;
      font-size: 1.6rem;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;
    }

    .header-title mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.15);
      padding: 8px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .count-badge {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 1.05rem;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* Filters Section */
    .filters-section {
      padding: 28px 36px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      display: flex;
      gap: 18px;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 3px solid rgba(139, 108, 80, 0.2);
    }

    .search-field {
      flex: 2;
      min-width: 250px;
    }

    .filter-field {
      flex: 1;
      min-width: 150px;
    }

    .clear-btn {
      color: #667eea;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 80px 24px;
    }

    .loading-state p {
      font-size: 1.1rem;
      color: #6c757d;
      margin-top: 24px;
    }

    /* Table Container */
    .table-container {
      overflow-x: auto;
    }

    .reservations-table {
      width: 100%;
    }

    .header-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      color: #2d2416;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .header-cell mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #c4a574;
    }

    th {
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      font-weight: 700;
      padding: 18px !important;
      border-bottom: 2px solid rgba(139, 108, 80, 0.15);
    }

    td {
      padding: 18px !important;
      border-bottom: 1px solid rgba(139, 108, 80, 0.08);
    }

    .table-row {
      transition: all 0.25s ease;
      cursor: pointer;
    }

    .table-row:hover {
      background: linear-gradient(135deg, #faf8f5 0%, #f7f4ef 100%);
      transform: scale(1.005);
    }

    .id-badge {
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 3px 12px rgba(139, 108, 80, 0.3);
      letter-spacing: 0.02em;
    }

    .user-id {
      color: #6d5d4b;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .type-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      background: linear-gradient(135deg, #fff4e6 0%, #ffe8cc 100%);
      color: #d4722c;
      border-radius: 18px;
      font-weight: 700;
      font-size: 0.85rem;
      box-shadow: 0 3px 12px rgba(212, 114, 44, 0.2);
      border: 1px solid rgba(212, 114, 44, 0.2);
    }

    .type-chip mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 18px;
      font-weight: 700;
      font-size: 0.85rem;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .status-chip mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-pending {
      background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
      color: #2d2416;
    }

    .status-confirmed {
      background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
      color: white;
    }

    .status-cancelled {
      background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
      color: white;
    }

    .status-completed {
      background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
      color: white;
    }

    .price-value {
      font-size: 1.15rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #d4722c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .date-value {
      color: #6d5d4b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .action-menu-btn {
      color: #c4a574;
      transition: all 0.2s ease;
    }

    .action-menu-btn:hover {
      background: rgba(196, 165, 116, 0.1);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
    }

    .empty-state mat-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #dee2e6;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .empty-state p {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0;
    }

    /* Pagination */
    mat-paginator {
      border-top: 2px solid #e9ecef;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .hero-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters-section {
        flex-direction: column;
      }

      .search-field,
      .filter-field {
        width: 100%;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  filteredReservations: ReservationResponse[] = [];
  paginatedReservations: ReservationResponse[] = [];
  displayedColumns = ['id', 'user', 'type', 'status', 'total', 'date', 'actions'];
  
  // Filter and search
  searchText: string = '';
  filterStatus: string = 'ALL';
  filterType: string = 'ALL';
  
  // Pagination
  pageSize: number = 10;
  pageIndex: number = 0;
  
  // Loading states
  importing = false;
  importingFlights = false;
  clearingFlights = false;
  loading = false;
  errorMessage = '';

  constructor(
    private resSvc: ReservationService,
    private adminSvc: AdminService,
    private authSvc: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.authSvc.isAuthenticated()) {
      this.errorMessage = 'Please log in to access admin dashboard';
      return;
    }
    this.loadReservations();
  }

  private loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.resSvc.getAllReservations().subscribe({
      next: (r: ReservationResponse[]) => {
        this.reservations = r;
        this.filteredReservations = r;
        this.updatePaginatedData();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading reservations:', err);
        this.errorMessage = 'Failed to load reservations. Admin access required.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reservations];

    // Search filter
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(r =>
        r.id.toString().includes(search) ||
        r.userId.toString().includes(search)
      );
    }

    // Status filter
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === this.filterStatus);
    }

    // Type filter
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(r => r.type === this.filterType);
    }

    this.filteredReservations = filtered;
    this.pageIndex = 0;
    this.updatePaginatedData();
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = 'ALL';
    this.filterType = 'ALL';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReservations = this.filteredReservations.slice(startIndex, endIndex);
  }

  getStatusCount(status: string): number {
    return this.reservations.filter(r => r.status === status).length;
  }

  getTotalRevenue(): number {
    return this.reservations.reduce((sum, r) => sum + r.totalPrice, 0);
  }

  getTypeLabel(type: ReservationType): string {
    switch (type) {
      case ReservationType.FLIGHT: return 'Flight';
      case ReservationType.HOTEL: return 'Hotel';
      case ReservationType.BOTH: return 'Package';
      default: return 'Unknown';
    }
  }

  getTypeIcon(type: ReservationType): string {
    switch (type) {
      case ReservationType.FLIGHT: return 'flight';
      case ReservationType.HOTEL: return 'hotel';
      case ReservationType.BOTH: return 'card_travel';
      default: return 'event';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'schedule';
      case 'CONFIRMED': return 'check_circle';
      case 'CANCELLED': return 'cancel';
      case 'COMPLETED': return 'done_all';
      default: return 'info';
    }
  }

  importDestinations(): void {
    this.importing = true;
    this.adminSvc.importDestinations().subscribe({
      next: (result) => {
        this.importing = false;
        this.snackBar.open(
          `Successfully imported ${result.count} destinations!`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.importing = false;
        this.snackBar.open(
          'Failed to import destinations: ' + err.message,
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  importFlights(): void {
    this.importingFlights = true;
    this.adminSvc.importFlights().subscribe({
      next: (result) => {
        this.importingFlights = false;
        this.snackBar.open(
          `Successfully imported ${result.count} flights!`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.importingFlights = false;
        this.snackBar.open(
          'Failed to import flights: ' + err.message,
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  clearFlights(): void {
    if (!confirm('Are you sure you want to clear all flights? This cannot be undone.')) {
      return;
    }
    this.clearingFlights = true;
    this.adminSvc.clearFlights().subscribe({
      next: () => {
        this.clearingFlights = false;
        this.snackBar.open(
          'All flights cleared successfully!',
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        this.clearingFlights = false;
        this.snackBar.open(
          'Failed to clear flights: ' + err.message,
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
