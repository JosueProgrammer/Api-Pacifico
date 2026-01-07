import { HttpException, HttpStatus } from '@nestjs/common';

export class HandlerException extends HttpException {
  constructor(message: string, status: HttpStatus, title = '') {
    super({ message, title }, status);
  }
}

export class BadRequestException extends HandlerException {
  constructor(message: string, title = '') {
    super(message, HttpStatus.BAD_REQUEST, title);
  }
}

export class UnauthorizedException extends HandlerException {
  constructor(message: string, title = '') {
    super(message, HttpStatus.UNAUTHORIZED, title);
  }
}

export class ForbiddenException extends HandlerException {
  constructor(message: string, title = '') {
    super(message, HttpStatus.FORBIDDEN, title);
  }
}

export class NotFoundException extends HandlerException {
  constructor(message: string, title = '') {
    super(message, HttpStatus.NOT_FOUND, title);
  }
}

export class InternalServerErrorException extends HandlerException {
  constructor(message: string, title = '') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, title);
  }
}

// Excepciones específicas para el sistema de horarios del CUR-CARAZO
export class ScheduleConflictException extends HandlerException {
  constructor(message: string, title = 'Conflicto de Horario Académico') {
    super(message, HttpStatus.CONFLICT, title);
  }
}

export class InvalidTimeRangeException extends HandlerException {
  constructor(message: string, title = 'Rango de Tiempo Académico Inválido') {
    super(message, HttpStatus.BAD_REQUEST, title);
  }
}

export class TeacherNotAvailableException extends HandlerException {
  constructor(message: string, title = 'Docente No Disponible') {
    super(message, HttpStatus.BAD_REQUEST, title);
  }
}

export class ClassroomNotAvailableException extends HandlerException {
  constructor(message: string, title = 'Aula No Disponible') {
    super(message, HttpStatus.BAD_REQUEST, title);
  }
}

export class StudentScheduleConflictException extends HandlerException {
  constructor(message: string, title = 'Conflicto de Horario del Estudiante') {
    super(message, HttpStatus.CONFLICT, title);
  }
}

export class AcademicPeriodException extends HandlerException {
  constructor(message: string, title = 'Error en Período Académico') {
    super(message, HttpStatus.BAD_REQUEST, title);
  }
}

// Add other custom exceptions as needed

