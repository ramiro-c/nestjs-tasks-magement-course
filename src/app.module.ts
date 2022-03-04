import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema: configValidationSchema }),
    TasksModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const isProduction = config.get<string>('STAGE') === 'prod';
        return {
          ssl: isProduction ? { rejectUnauthorized: false } : null,
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          url: config.get<string>('DATABASE_URL'),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
