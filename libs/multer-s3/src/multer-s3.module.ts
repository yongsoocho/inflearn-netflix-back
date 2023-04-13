import { Module } from "@nestjs/common";
import { MulterS3Service } from "./multer-s3.service";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [MulterModule],
  providers: [MulterS3Service],
  exports: [MulterS3Service],
})
export class MulterS3Module {}
