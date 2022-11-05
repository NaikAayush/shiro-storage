import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EthersService } from './services/ethers/ethers.service.js';
import { IpfsService } from './services/ipfs/ipfs.service.js';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, EthersService, IpfsService],
})
export class AppModule {}
