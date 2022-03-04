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
          url: config.get<string>('DATABASE_URL'),
          ssl: isProduction ? { rejectUnauthorized: false } : null,
          type: 'postgres',
          entities: ['dist/**/*.entity{.ts,.js}'],
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
