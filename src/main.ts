import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const app = await NestFactory.create(AppModule);

await app.listen(3000);
console.log(`Application is running on: ${await app.getUrl()}`);
