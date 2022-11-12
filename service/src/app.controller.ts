import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service.js';
import { IpfsService } from './services/ipfs/ipfs.service.js';

const PRICE_PER_GB_USD: number = 0.01;

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly ipfs: IpfsService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Returns price of storing the given CID.
  @Get('estimatePrice')
  async estimatePrice(@Query('cid') cid?: string) {
    if (cid === null || cid === undefined) {
      throw new HttpException(
        '`cid` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }
    const size = await this.ipfs.getFileSize(cid);
    const sizeGB = size / 10 ** 9;
    const price = PRICE_PER_GB_USD * sizeGB;
    console.log(
      `estimate (${cid}) - size: ${size} bytes (${sizeGB} GB), price: ${price}`,
    );
    return { price: price };
  }
}
