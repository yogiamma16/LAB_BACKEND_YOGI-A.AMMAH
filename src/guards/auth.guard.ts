import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppService } from '../app.service';
import { plainToInstance } from 'class-transformer';
import { User } from '../entity/user.entity';
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly appService: AppService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        const token = authHeader.split(' ')[1]; 

        try {
            const payload: { id: number } = this.jwtService.verify(token);
            console.log('Payload decoded from token:', payload); 

            const user = await this.appService.auth(payload.id);
            console.log('User from auth service:', user);  

            request.user = plainToInstance(User, user); 

        } catch (err) {
            if (err instanceof HttpException) throw err;
            throw new UnauthorizedException('Invalid token');
        }

        return true;  
    }
}

