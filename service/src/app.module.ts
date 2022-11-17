import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EthersService } from './services/ethers/ethers.service.js';
import { IpfsService } from './services/ipfs/ipfs.service.js';
import { StorageService } from './services/storage/storage.service.js';
import { Web3StorageService } from './services/web3-storage/web3-storage.service.js';
import { SendgridService } from './services/sendgrid/sendgrid.service.js';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    EthersService,
    IpfsService,
    StorageService,
    Web3StorageService,
    SendgridService,
  ],
})
export class AppModule {}
