import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const PORT = 8000;

(async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(PORT);
  console.log(`Media backend listening on port ${PORT}`);
})();
