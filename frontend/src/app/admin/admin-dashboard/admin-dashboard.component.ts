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
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 80px 24px 60px;
      margin-bottom: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
    }

    .hero-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
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
      border-radius: 16px;
      margin-bottom: 24px;
      border: 2px solid #e9ecef;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
      padding: 24px 24px 16px;
      border-bottom: 2px solid #e9ecef;
    }

    .card-header mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    .actions-grid {
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-button {
      height: 56px !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 1rem !important;
      font-weight: 600 !important;
    }

    .action-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
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
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 16px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: #667eea;
    }

    .stat-content {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .stat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      padding: 16px;
      border-radius: 12px;
    }

    .stat-icon.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-icon.pending {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: white;
    }

    .stat-icon.confirmed {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
      color: white;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.95rem;
      color: #6c757d;
      font-weight: 600;
    }

    /* Table Card */
    .table-card {
      border-radius: 16px;
      border: 2px solid #e9ecef;
      overflow: hidden;
    }

    .table-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 16px;
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-title mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .count-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 16px;
      border-radius: 16px;
      font-size: 1rem;
    }

    /* Filters Section */
    .filters-section {
      padding: 24px 32px;
      background: #f8f9fa;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 2px solid #e9ecef;
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
      gap: 8px;
      font-weight: 700;
      color: #2c3e50;
      font-size: 0.95rem;
    }

    .header-cell mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    th {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      font-weight: 700;
      padding: 16px !important;
    }

    td {
      padding: 16px !important;
    }

    .table-row {
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .table-row:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%);
    }

    .id-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-id {
      color: #6c757d;
      font-weight: 500;
    }

    .type-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      color: #1976d2;
      border-radius: 16px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .type-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .status-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-pending {
      background: #ffc107;
      color: #2c3e50;
    }

    .status-confirmed {
      background: #4caf50;
      color: white;
    }

    .status-cancelled {
      background: #f44336;
      color: white;
    }

    .status-completed {
      background: #2196f3;
      color: white;
    }

    .price-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #667eea;
    }

    .date-value {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .action-menu-btn {
      color: #667eea;
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
