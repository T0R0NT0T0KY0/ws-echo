import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { EventsModule } from "./events/events.module.js";

@Module({
  imports: [EventsModule, PrometheusModule.register({
    path: "/metrics",
    defaultMetrics: { enabled: true },
  })],
})
export class AppModule {
}
