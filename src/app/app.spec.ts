import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should toggle and close mobile drawer', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['isMobileDrawerOpen']()).toBe(false);

    app['toggleMobileDrawer']();
    expect(app['isMobileDrawerOpen']()).toBe(true);

    app['closeMobileDrawer']();
    expect(app['isMobileDrawerOpen']()).toBe(false);
  });

  it('should close mobile drawer when router navigates', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);

    app['toggleMobileDrawer']();
    expect(app['isMobileDrawerOpen']()).toBe(true);

    (router.events as unknown as Subject<unknown>).next(new NavigationEnd(1, '/trilhas', '/trilhas'));
    expect(app['isMobileDrawerOpen']()).toBe(false);
  });

  it('should close mobile drawer on escape keydown', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['toggleMobileDrawer']();
    expect(app['isMobileDrawerOpen']()).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    fixture.nativeElement.dispatchEvent(event);
    expect(app['isMobileDrawerOpen']()).toBe(false);
  });
});
