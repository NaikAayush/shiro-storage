import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BigNumber } from 'ethers';
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
  @Get('fileSizeOnly')
  async fileSizeOnly(@Query('cid') cid?: string) {
    if (cid === null || cid === undefined) {
      throw new HttpException(
        '`cid` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }
    const size = await this.ipfs.getFileSize(cid);
    return { size, cid };
  }

  // Returns price of storing the given CID.
  // NOTE: used by chainlink job, don't change.
  @Get('fileSize')
  async fileSize(
    @Query('cid') cid?: string,
    @Query('owner') owner?: string,
    @Query('validity') validity?: number,
  ) {
    if (cid === null || cid === undefined) {
      throw new HttpException(
        '`cid` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (owner === null || owner === undefined) {
      throw new HttpException(
        '`owner` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (validity === null || validity === undefined) {
      throw new HttpException(
        '`validity` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }

    owner = '0x' + owner;

    const size = await this.ipfs.getFileSize(cid);
    return { size: size, cid, owner, validity };
  }

  // Returns price of storing the given CID.
  @Get('estimatePrice')
  async estimatePrice(
    @Query('cid') cid?: string,
    @Query('validity') validity?: number,
  ) {
    if (cid === null || cid === undefined) {
      throw new HttpException(
        '`cid` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (validity === null || validity === undefined) {
      throw new HttpException(
        '`validity` was not given in query',
        HttpStatus.BAD_REQUEST,
      );
    }

    // this is 10^11
    const bytePerUsd = BigNumber.from(10).pow(10);

    const size = BigNumber.from(await this.ipfs.getFileSize(cid));
    const sizeGB = size.div(BigNumber.from(10).pow(9));
    // TODO: get this from price feed
    const usdPerEth = BigNumber.from(1216);
    const priceFeedDecimals = 0;

    const numerator = size
      .mul(BigNumber.from(10).pow(priceFeedDecimals))
      .mul(BigNumber.from(10).pow(18))
      .mul(validity)
    const denom = bytePerUsd.mul(usdPerEth).mul(1000).mul(3600);
    const price = numerator.div(denom);
    console.log(numerator.toString(), denom.toString(), price.toString());

    console.log(
      `estimate (${cid}) - size: ${size} bytes (${sizeGB} GB), price: ${price}`,
    );
    return { price: price.toString() };
  }
}
