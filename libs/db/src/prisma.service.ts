import { Injectable, OnModuleInit, INestApplication } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }

  findUserByEmail(email: string, profiles = false) {
    return this.user.findUnique({
      where: {
        email,
      },
      include: {
        profiles,
      },
    });
  }
}
