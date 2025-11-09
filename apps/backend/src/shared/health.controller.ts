import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    hello() {
        return { ok: true, ts: new Date().toISOString() };
    }
}
