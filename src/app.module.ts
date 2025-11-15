import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PayrollProcessingModule } from './payroll-processing/payroll-processing.module';

@Module({
  imports: [
    MongooseModule.forRoot(
       'mongodb+srv://TeamUser:TeamUser@cluster0.mfclf62.mongodb.net/', {
}),
    PayrollProcessingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
