import { Transform } from 'class-transformer';

/**
 * Decorador que convierte strings a mayúsculas
 */
export function TransformUppercase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  });
}


