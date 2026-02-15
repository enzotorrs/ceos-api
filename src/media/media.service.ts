import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private readonly logger = new Logger(MediaService.name);
  private readonly bucketName?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      requestChecksumCalculation: 'WHEN_REQUIRED',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    } as any);
  }

  async getSignedUploadUrl(key: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate upload URL for key ${key}`, error);
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate download URL for key ${key}`,
        error,
      );
      throw new InternalServerErrorException('Could not generate download URL');
    }
  }
}
