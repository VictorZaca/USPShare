import { renderHook, act } from '@testing-library/react';
import useDebounce from './useDebounce';

jest.useFakeTimers();

describe('useDebounce Hook', () => {

  test('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('valor inicial', 500));

    expect(result.current).toBe('valor inicial');
  });

  test('should only update the debounced value after the specified delay', () => {
    const initialProps = { value: 'primeiro', delay: 500 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps }
    );

    expect(result.current).toBe('primeiro');

    rerender({ value: 'segundo', delay: 500 });

    expect(result.current).toBe('primeiro');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('segundo');
  });

  test('should only use the latest value if the value changes multiple times within the delay period', () => {
    const { result, rerender } = renderHook(() => useDebounce('A', 500));

    expect(result.current).toBe('A');

    rerender('B');
    rerender('C');

    expect(result.current).toBe('A');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('C');
  });

  test('should handle rapid changes correctly', () => {
    const { result, rerender } = renderHook(() => useDebounce('start', 500));

    expect(result.current).toBe('start');
    
    rerender('update 1');
    
    act(() => {
        jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe('start');
    
    rerender('update 2');
    
    expect(result.current).toBe('start');

    act(() => {
        jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('update 2');
  });
});