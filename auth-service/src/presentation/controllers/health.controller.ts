import { Controller, Get } from "@nestjs/common";
import { ok } from "assert";

@Controller('health')
export class HealthController {
    @Get()
    async health() {
        return { status: 'ok', service: 'auth-service' };
    }
    
}