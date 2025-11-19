import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {AppController} from './app.controller';
import { AppService } from './app.service';
import { PayrollProcessingAndExecutionModule } from './payroll-processing-and-execution/payroll-processing-and-execution.module';

@Module({
  imports: [PayrollProcessingAndExecutionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
