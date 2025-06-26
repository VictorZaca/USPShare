import { useState, useEffect } from 'react';

// Este hook customizado recebe um valor e um delay...
export default function useDebounce<T>(value: T, delay: number): T {
  // ...e retorna um novo valor que só é atualizado após o delay.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Configura um timer para atualizar o valor debounced após o 'delay'
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Função de limpeza: cancela o timer se o 'value' mudar antes do delay terminar
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Roda este efeito novamente apenas se o valor ou o delay mudar
  );

  return debouncedValue;
}