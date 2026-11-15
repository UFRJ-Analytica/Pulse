import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'analytica-pulse-api',
      timestamp: new Date().toISOString(),
    } as const;
  }
}
