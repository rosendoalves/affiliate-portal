import { Controller, Get } from '@nestjs/common';
import pkg from '../../package.json';

@Controller('health')
export class HealthController {
    @Get()
    get() {
        return {
            ok: true,
            name: pkg.name,
            version: pkg.version,
            ts: Date.now(),
        };
    }
}
