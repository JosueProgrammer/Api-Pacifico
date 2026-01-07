import { Transform } from 'class-transformer';

/**
 * Decorador que normaliza el email:
 * - Elimina espacios en blanco (trim)
 * - Convierte a minúsculas
 */
export function TransformEmail() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  });
}


