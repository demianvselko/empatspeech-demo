import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function applySwagger(app: NestFastifyApplication): Promise<void> {
  const config = new DocumentBuilder()
    .setTitle('EmpatSpeech API')
    .setDescription('REST API')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  const doc = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, doc, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
