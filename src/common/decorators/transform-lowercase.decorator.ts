import { Transform } from 'class-transformer';

/**
 * Decorador que convierte strings a minúsculas
 */
export function TransformLowercase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  });
}


