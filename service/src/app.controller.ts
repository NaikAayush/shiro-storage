import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { BigNumber } from 'ethers';
import { AppService } from './app.service.js';
import { EmailBody } from './interfaces/email-body.js';
import { IpfsService } from './services/ipfs/ipfs.service.js';
import { SendgridService } from './services/sendgrid/sendgrid.service.js';
import { createClient, RedisClientType } from 'redis';
import { FileNameBody } from './interfaces/filename-body.js';

const PRICE_PER_GB_USD: number = 0.01;

@Controller()
export class AppController {
  redisClient: RedisClientType;

  constructor(
    private readonly appService: AppService,
    private readonly ipfs: IpfsService,
    private readonly sendGrid: SendgridService,
  ) {
    this.startRedis();
  }

  async startRedis() {
    this.redisClient = createClient({
      url: 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
    });
    this.redisClient.on('error', (err) =>
      console.log('Redis Client Error', err),
    );
    await this.redisClient.connect();
  }

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
      .mul(validity);
    const denom = bytePerUsd.mul(usdPerEth).mul(1000).mul(3600);
    const price = numerator
      .div(denom)
      .add(BigNumber.from(30).mul(BigNumber.from(10).pow(9)));
    console.log(numerator.toString(), denom.toString(), price.toString());

    console.log(
      `estimate (${cid}) - size: ${size} bytes (${sizeGB} GB), price: ${price}`,
    );
    return { price: price.toString() };
  }

  // Send emails using SendGrid
  @Post('email')
  async sendEmail(@Body() data: EmailBody) {
    return this.sendGrid.sendMail(data);
  }

  // Returns Filename for a given CID
  @Get('fileName')
  async getFileName(@Query('cid') cid?: string) {
    return {
      cid: cid,
      status: await this.redisClient.get(cid),
    };
  }

  // Sets Filename for a given CID
  @Post('fileName')
  async setFileName(@Body() data: FileNameBody) {
    return {
      status: await this.redisClient.set(data.cid, data.fileName),
    };
  }
}
