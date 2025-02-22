import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import PrismaService from './prisma';
import { JwtModule } from '@nestjs/jwt';
import { MahasiswaProfileModule } from './mahasiswa-profile/mahasiswa-profile.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
    }),
    MahasiswaProfileModule,
    ChatModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }