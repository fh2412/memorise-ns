import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { authGuard } from './auth.guard';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: authGuard;
  let mockRouter: any;
  let mockAngularFireAuth: any;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockAngularFireAuth = {
      authState: of(null) // Use this to mock the authState observable behavior
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule // Import RouterTestingModule for router related testing
      ],
      providers: [
        authGuard,
        { provide: Router, useValue: mockRouter },
        { provide: AngularFireAuth, useValue: mockAngularFireAuth }
      ]
    });

    guard = TestBed.inject(authGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', (done) => {
    mockAngularFireAuth.authState = of({ /* mock user object */ });

    guard.canActivate().subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should not allow access when user is not authenticated', (done) => {
    mockAngularFireAuth.authState = of(null);

    guard.canActivate().subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
