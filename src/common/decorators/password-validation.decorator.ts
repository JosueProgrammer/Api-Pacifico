import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          
          return strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a strong password with at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character`;
        },
      },
    });
  };
}


