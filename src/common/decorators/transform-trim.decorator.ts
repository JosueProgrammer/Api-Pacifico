import { Transform } from 'class-transformer';

/**
 * Decorador que elimina espacios en blanco al inicio y final de strings
 */
export function TransformTrim() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}


