export * from "./multer-s3.module";
export * from "./multer-s3.service";

import multerS3 from "multer-s3";
import { S3 } from "aws-sdk";
import { v4 } from "uuid";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESSKEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
});

export const MulterOptions = {
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, `profile/${v4()}_${file.originalname}`);
    },
  }),
};

export interface IFilesInterceptor {
  fieldname: string | "images";
  originalname: string | "test.jpeg";
  encoding: string | "7bit";
  mimetype: string | "image/jpeg";
  buffer: string | "buffer data";
  size: number | 43091;
  key: string | "clothes/Date.now()_originalname";
  localtion: string | "s3 address";
}

// const metaDataFile = {
//   filedname: 'images',
//   originalname: 'test.jpeg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg'
// }
