import { useEffect } from 'react';

export function useDateInputBounds() {
  useEffect(() => {
    const lastValid = new WeakMap<HTMLInputElement, string>();
    const applyBounds = (input: HTMLInputElement) => {
      if (!input.min) input.min = '1900-01-01';
      if (!input.max) input.max = '2100-12-31';
    };
    const validateDate = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== 'date') return;
      applyBounds(input);
      const value = input.value;
      if (!value) return;
      const match = /^(\d+)-(\d{2})-(\d{2})$/.exec(value);
      const year = match?.[1] || '';
      const valid = year.length === 4 && Number(year) >= 1900 && Number(year) <= 2100 && value >= input.min && value <= input.max;
      if (!valid) {
        input.value = lastValid.get(input) || '';
        input.setCustomValidity('Enter a valid four-digit year within the allowed date range.');
        input.title = 'Enter a valid four-digit year within the allowed date range.';
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      lastValid.set(input, value);
      input.setCustomValidity('');
      input.removeAttribute('title');
    };
    document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(applyBounds);
    const observer = new MutationObserver(() => document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(applyBounds));
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('blur', validateDate, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('blur', validateDate, true);
    };
  }, []);
}
