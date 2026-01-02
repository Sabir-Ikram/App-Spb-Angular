import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuth = { login: jest.fn() };
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should call auth.login and navigate on success', () => {
    component.email = 'a@b.com';
    component.password = 'pw';
    mockAuth.login.mockReturnValue(of(void 0));
    component.onSubmit();
    expect(mockAuth.login).toHaveBeenCalledWith('a@b.com', 'pw');
  });

  it('should show alert on error', () => {
    spyOn(window, 'alert');
    mockAuth.login.mockReturnValue(throwError(() => new Error('fail')));
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Login failed');
  });
});
