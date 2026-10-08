import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  it('should initialize with default mode', () => {
    expect(['system', 'light', 'dark']).toContain(service.mode());
  });

  it('should switch mode between light and dark', () => {
    service.setMode('light');
    expect(service.mode()).toBe('light');
    expect(service.isDark()).toBe(false);

    service.setMode('dark');
    expect(service.mode()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('should toggle theme properly', () => {
    service.setMode('light');
    service.toggleTheme();
    expect(service.isDark()).toBe(true);

    service.toggleTheme();
    expect(service.isDark()).toBe(false);
  });
});
