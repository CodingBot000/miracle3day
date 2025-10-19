import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.LIGHTSAIL_REGION,
  // Lightsail Object Storage는 S3 호환이므로 endpoint 지정해도 되고 생략해도 됩니다.
  // 버킷 전용 엔드포인트를 쓸 때는 아래 사용:
//   endpoint: process.env.LIGHTSAIL_ENDPOINT, 
  credentials: {
    accessKeyId: process.env.LIGHTSAIL_ACCESS_KEY!,
    secretAccessKey: process.env.LIGHTSAIL_SECRET_KEY!,
  },
  // 필요 시 path-style 강제: forcePathStyle: true,
    // Lightsail Object Storage는 원칙적으로 S3와 동일하게 동작합니다.
  // endpoint를 일부러 지정하지 않으면 AWS SDK가 안정적으로 해석합니다.
  // 필요한 경우에만: endpoint: process.env.LIGHTSAIL_ENDPOINT,
});
