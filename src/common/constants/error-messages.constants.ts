/**
 * Constantes para mensajes de error consistentes en español
 */
export const ERROR_MESSAGES = {
  // Mensajes generales
  INTERNAL_SERVER_ERROR: 'Ocurrió un error al procesar la solicitud',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_FAILED: 'Error de validación',
  INVALID_INPUT: 'Entrada inválida',
  
  // Mensajes de autenticación
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  UNAUTHORIZED: 'No autorizado',
  TOKEN_REQUIRED: 'Token de autenticación requerido',
  TOKEN_INVALID: 'Token inválido o expirado',
  REFRESH_TOKEN_INVALID: 'Refresh token inválido o expirado',
  REFRESH_TOKEN_TYPE_INVALID: 'Token no es un refresh token válido',
  USER_NOT_FOUND_OR_INACTIVE: 'Usuario no encontrado o inactivo',
  TOKEN_RENEWAL_ERROR: 'Error al renovar tokens',
  
  // Mensajes de base de datos
  DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
  FOREIGN_KEY_VIOLATION: 'Violación de clave foránea',
  INVALID_INPUT_SYNTAX: 'Sintaxis de entrada inválida',
  DATABASE_ERROR: 'Error en la base de datos',
  
  // Mensajes de validación de parámetros
  PAGE_MUST_BE_POSITIVE: 'La página debe ser un número positivo',
  LIMIT_MUST_BE_VALID: 'El límite debe estar entre 1 y 100',
  SORT_ORDER_INVALID: 'El orden debe ser ASC o DESC',
  INVALID_FILTERS_JSON: 'Formato JSON de filtros inválido',
  FILTER_VALUE_REQUIRED: 'Se requiere un valor para el filtro',
  FILTER_FIELD_REQUIRED: 'Se requiere un campo para el filtro',
  INVALID_FILTER_RULE: 'Regla de filtro inválida',
  
  // Mensajes de archivos
  FILE_NOT_PROVIDED: 'No se proporcionó ningún archivo',
  FILE_TYPE_NOT_ALLOWED: 'Tipo de archivo no permitido',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  FILE_UPLOAD_ERROR: 'Error al subir archivo',
  FILE_DELETE_ERROR: 'Error al eliminar archivo',
  FILE_METADATA_ERROR: 'Error al obtener metadatos del archivo',
  FILE_SIGNED_URL_ERROR: 'Error al generar URL firmada',
  
  // Mensajes de usuarios
  USER_ALREADY_EXISTS: 'El usuario ya existe con este correo',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_INACTIVE: 'Usuario inactivo',
  EMAIL_ALREADY_IN_USE: 'El correo ya está en uso por otro usuario',
  ROLE_NOT_FOUND: 'Rol no encontrado',
  
  // Mensajes de contraseñas
  PASSWORD_RESET_CODE_INVALID: 'Código inválido o ya utilizado',
  PASSWORD_RESET_CODE_EXPIRED: 'El código ha expirado',
  PASSWORD_SAME_AS_CURRENT: 'Debes ingresar una contraseña diferente a la actual',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta',
  PASSWORD_VALIDATION_FAILED: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, números y un carácter especial',
  
  // Mensajes de recursos específicos
  DEPARTMENT_NOT_FOUND: 'Departamento no encontrado',
  DEPARTMENT_ALREADY_EXISTS: 'Ya existe un departamento con este nombre',
  ACADEMIC_PROGRAM_NOT_FOUND: 'Programa académico no encontrado',
  ACADEMIC_PROGRAM_ALREADY_EXISTS: 'Ya existe un programa académico con este nombre',
  ACADEMIC_PERIOD_NOT_FOUND: 'Período académico no encontrado',
  ACADEMIC_PERIOD_ALREADY_EXISTS: 'Ya existe un período académico con estos datos',
  ACADEMIC_PERIOD_NAME_EXISTS: 'Ya existe un período académico con este nombre',
  ACADEMIC_PERIOD_OVERLAPS: 'Ya existe un período académico activo que se solapa con las fechas especificadas',
  ACADEMIC_PERIOD_INVALID_DATES: 'La fecha de fin debe ser posterior a la fecha de inicio',
  TIME_RANGE_INVALID: 'La hora de inicio debe ser anterior a la hora de fin',
  CLASSROOM_NOT_FOUND: 'Aula no encontrada',
  CLASSROOM_ALREADY_EXISTS: 'Ya existe un aula con este nombre',
  LOCATION_NOT_FOUND: 'Ubicación no encontrada',
  LOCATION_ALREADY_EXISTS: 'Ya existe una ubicación con este nombre',
  HOLIDAY_NOT_FOUND: 'Día feriado no encontrado',
  HOLIDAY_ALREADY_EXISTS: 'Ya existe un día feriado con esta fecha',
  SUBJECT_NOT_FOUND: 'Asignatura no encontrada',
  SUBJECT_ALREADY_EXISTS: 'Ya existe una asignatura con este código',
  TEACHER_NOT_FOUND: 'Docente no encontrado',
  TEACHER_ALREADY_EXISTS_CEDULA: 'Ya existe un docente con esta cédula',
  TEACHER_ALREADY_EXISTS_CARNET: 'Ya existe un docente con este carnet',
  TEACHER_ALREADY_EXISTS_EMAIL: 'Ya existe un docente con este correo electrónico',
  GROUP_NOT_FOUND: 'Grupo no encontrado',
  GROUP_ALREADY_EXISTS_CODE: 'Ya existe un grupo con este código',
  GROUP_ALREADY_EXISTS_NAME: 'Ya existe un grupo con este nombre para la misma asignatura y período',
  SCHEDULE_NOT_FOUND: 'Horario no encontrado',
  SCHEDULE_CONSTRAINT_NOT_FOUND: 'Restricción de horario no encontrada',
  SCHEDULE_CONSTRAINT_ALREADY_EXISTS: 'Ya existe una restricción de tipo similar para este docente',
  
  // Mensajes de Firebase
  FIREBASE_NOT_INITIALIZED: 'Firebase app no está inicializada. Llama a getInstance() primero',
  
  // Mensajes de categorías
  CATEGORIA_NOT_CREATED: 'Error al crear la categoría',
  CATEGORIA_NOT_UPDATED: 'Error al actualizar la categoría',
  CATEGORIA_NOT_DELETED: 'Error al eliminar la categoría',
  CATEGORIAS_NOT_FOUND: 'Error al obtener las categorías',
  CLIENTES_NOT_FOUND: 'Error al obtener los clientes',
  CLIENTE_NOT_UPDATED: 'Error al actualizar el cliente',
  CLIENTE_NOT_CREATED: 'Error al crear el cliente',
  CLIENTE_NOT_DELETED: 'Error al eliminar el cliente',
  
  // Mensajes de productos
  PRODUCTO_NOT_CREATED: 'Error al crear el producto',
  PRODUCTO_NOT_UPDATED: 'Error al actualizar el producto',
  PRODUCTO_NOT_DELETED: 'Error al eliminar el producto',
  PRODUCTOS_NOT_FOUND: 'Error al obtener los productos',

  // Mensajes de ventas
  VENTA_NOT_CREATED: 'Error al crear la venta',
  VENTA_NOT_UPDATED: 'Error al actualizar la venta',
  VENTA_NOT_DELETED: 'Error al eliminar la venta',
  VENTAS_NOT_FOUND: 'Error al obtener las ventas',

  // Mensajes de compras
  COMPRA_NOT_CREATED: 'Error al crear la compra',
  COMPRA_NOT_UPDATED: 'Error al actualizar la compra',
  COMPRA_NOT_DELETED: 'Error al eliminar la compra',
  COMPRAS_NOT_FOUND: 'Error al obtener las compras',

  // Mensajes de métodos de pago
  METODO_PAGO_NOT_CREATED: 'Error al crear el método de pago',
  METODO_PAGO_NOT_UPDATED: 'Error al actualizar el método de pago',
  METODO_PAGO_NOT_DELETED: 'Error al eliminar el método de pago',
  METODOS_PAGO_NOT_FOUND: 'Error al obtener los métodos de pago',

  // Mensajes de inventario
  INVENTARIO_NOT_CREATED: 'Error al registrar el movimiento de inventario',
  INVENTARIO_NOT_FOUND: 'Error al obtener los movimientos de inventario',

  // Mensajes de descuentos
  DESCUENTO_NOT_CREATED: 'Error al crear el descuento',
  DESCUENTO_NOT_UPDATED: 'Error al actualizar el descuento',
  DESCUENTO_NOT_DELETED: 'Error al eliminar el descuento',
  DESCUENTOS_NOT_FOUND: 'Error al obtener los descuentos',

  // Mensajes de caja
  CAJA_NOT_OPENED: 'Error al abrir la caja',
  CAJA_NOT_CLOSED: 'Error al cerrar la caja',
  CAJA_NOT_FOUND: 'Caja no encontrada',
  CAJA_ALREADY_OPEN: 'Ya tienes una caja abierta. Debes cerrarla antes de abrir una nueva',
  CAJA_NOT_OPEN: 'No tienes una caja abierta',
  CAJA_ALREADY_CLOSED: 'La caja ya está cerrada',
  MOVIMIENTO_CAJA_NOT_CREATED: 'Error al registrar el movimiento de caja',
  MOVIMIENTOS_CAJA_NOT_FOUND: 'Error al obtener los movimientos de caja',
} as const;

/**
 * Títulos para errores
 */
export const ERROR_TITLES = {
  VALIDATION_ERROR: 'Error de Validación',
  AUTHENTICATION_ERROR: 'Error de Autenticación',
  AUTHORIZATION_ERROR: 'Error de Autorización',
  NOT_FOUND_ERROR: 'Recurso No Encontrado',
  CONFLICT_ERROR: 'Conflicto',
  INTERNAL_ERROR: 'Error Interno',
  INVALID_PARAMETER: 'Parámetro Inválido',
  INVALID_FILTERS: 'Formato de Filtros Inválido',
} as const;

