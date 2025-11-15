import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PayrollProcessingModule } from './payroll-processing/payroll-processing.module';

@Module({
  imports: [PayrollProcessingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
