import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EthersService } from './services/ethers/ethers.service';
import { IpfsService } from './services/ipfs/ipfs.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, EthersService, {
    provide: IpfsService, useFactory: async () => {
      const service = new IpfsService();
      await service.init();
      return service;
    }
  }],
})
export class AppModule { }
