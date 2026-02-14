import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import YAML from 'yamljs';
import helmet from 'helmet';

import { TransformResponseInterceptor } from './common/interceptor/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  
  // Integrar Helmet para seguridad
  app.use(helmet());

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configurar pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );


  // Usar interceptores globales
  app.useGlobalInterceptors(
    new TransformResponseInterceptor(),
    new LoggingInterceptor(),
  );

  // Configuración de Swagger para API Pacifico
  const config = new DocumentBuilder()
    .setTitle('API Pacifico')
    .setDescription('API REST para servicios de Pacifico')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      // Eliminar el sufijo "Controller" del nombre del controlador
      return `${controllerKey.replace('Controller', '')}_${methodKey}`;
    },
  });

  SwaggerModule.setup('docs', app, document);

  // Endpoint para descargar documentación en YAML
  app.getHttpAdapter().get('/swagger.yaml', (req, res) => {
    const swaggerYaml = YAML.stringify(document);
    res.setHeader('Content-Type', 'application/yaml');
    res.send(swaggerYaml);
  });

  const port = process.env.PORT || 3000;

  // Usar logger con nest-winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  await app.listen(port);

  Logger.log(
    `API Pacifico iniciado en el puerto: ${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger UI disponible en: http://localhost:${port}/docs`,
    'Bootstrap',
  );
  Logger.log(
    `Documentación YAML disponible en: http://localhost:${port}/swagger.yaml`,
    'Bootstrap',
  );
}

bootstrap();