import { Test, TestingModule } from '@nestjs/testing';
import { Web3StorageService } from './web3-storage.service';

describe('Web3StorageService', () => {
  let service: Web3StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3StorageService],
    }).compile();

    service = module.get<Web3StorageService>(Web3StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
