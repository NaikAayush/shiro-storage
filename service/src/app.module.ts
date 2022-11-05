import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EthersService } from './services/ethers/ethers.service.js';
import { IpfsService } from './services/ipfs/ipfs.service.js';
import { StorageService } from './services/storage/storage.service.js';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, EthersService, IpfsService, StorageService],
})
export class AppModule {}
