import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterHandlers } from '../use-filter-handlers';
import type { SearchFilters } from '../../types';

describe('useFilterHandlers', () => {
  it('should toggle category selection', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = {};

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleCategoryChange('technology');
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      category: 'technology',
    });
  });

  it('should deselect category when clicking same category', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = { category: 'technology' };

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleCategoryChange('technology');
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      category: undefined,
    });
  });

  it('should toggle source in sources array', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = {};

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleSourceToggle('newsapi');
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      sources: ['newsapi'],
    });
  });

  it('should remove source from sources array', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = { sources: ['newsapi', 'gnews'] };

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleSourceToggle('newsapi');
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      sources: ['gnews'],
    });
  });

  it('should set sources to undefined when removing last source', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = { sources: ['newsapi'] };

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleSourceToggle('newsapi');
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      sources: undefined,
    });
  });

  it('should update date range from DateRange object', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = {};

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleDateRangeChange({
        from: new Date('2024-01-01'),
        to: new Date('2024-01-15'),
      });
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      dateFrom: '2024-01-01',
      dateTo: '2024-01-15',
    });
  });

  it('should set dates to undefined when range is undefined', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = { dateFrom: '2024-01-01', dateTo: '2024-01-15' };

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.handleDateRangeChange(undefined);
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('should clear all filters except keyword', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = {
      keyword: 'test',
      category: 'technology',
      sources: ['newsapi'],
      dateFrom: '2024-01-01',
    };

    const { result } = renderHook(() =>
      useFilterHandlers(filters, onFiltersChange)
    );

    act(() => {
      result.current.handlers.clearFilters();
    });

    expect(onFiltersChange).toHaveBeenCalledWith({ keyword: 'test' });
  });

  it('should compute hasActiveFilters correctly', () => {
    const onFiltersChange = vi.fn();

    // No active filters
    const { result: result1 } = renderHook(() =>
      useFilterHandlers({}, onFiltersChange)
    );
    expect(result1.current.computed.hasActiveFilters).toBeFalsy();

    // With category
    const { result: result2 } = renderHook(() =>
      useFilterHandlers({ category: 'tech' }, onFiltersChange)
    );
    expect(result2.current.computed.hasActiveFilters).toBe(true);

    // With sources
    const { result: result3 } = renderHook(() =>
      useFilterHandlers({ sources: ['newsapi'] }, onFiltersChange)
    );
    expect(result3.current.computed.hasActiveFilters).toBe(true);

    // With dates
    const { result: result4 } = renderHook(() =>
      useFilterHandlers({ dateFrom: '2024-01-01' }, onFiltersChange)
    );
    expect(result4.current.computed.hasActiveFilters).toBe(true);
  });

  it('should toggle isOpen state', () => {
    const onFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useFilterHandlers({}, onFiltersChange)
    );

    expect(result.current.state.isOpen).toBe(false);

    act(() => {
      result.current.handlers.toggleOpen();
    });

    expect(result.current.state.isOpen).toBe(true);

    act(() => {
      result.current.handlers.toggleOpen();
    });

    expect(result.current.state.isOpen).toBe(false);
  });

  it('should compute selectedDateRange correctly', () => {
    const onFiltersChange = vi.fn();

    // No dates
    const { result: result1 } = renderHook(() =>
      useFilterHandlers({}, onFiltersChange)
    );
    expect(result1.current.computed.selectedDateRange).toBeUndefined();

    // With dateFrom only
    const { result: result2 } = renderHook(() =>
      useFilterHandlers({ dateFrom: '2024-01-01' }, onFiltersChange)
    );
    expect(result2.current.computed.selectedDateRange).toEqual({
      from: new Date('2024-01-01'),
      to: undefined,
    });

    // With both dates
    const { result: result3 } = renderHook(() =>
      useFilterHandlers({ dateFrom: '2024-01-01', dateTo: '2024-01-15' }, onFiltersChange)
    );
    expect(result3.current.computed.selectedDateRange).toEqual({
      from: new Date('2024-01-01'),
      to: new Date('2024-01-15'),
    });
  });
});
