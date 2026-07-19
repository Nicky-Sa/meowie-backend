import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { TasteService } from '@/taste/taste.service';
import { GenreRarityService } from '@/taste/genre-rarity.service';
import { TasteController } from '@/taste/taste.controller';
import { UserModule } from '@/user/user.module';
import { TmdbModule } from '@/tmdb/tmdb.module';

@Module({
  imports: [TypeOrmModule.forFeature([Taste]), UserModule, TmdbModule],
  controllers: [TasteController],
  providers: [TasteService, GenreRarityService],
  exports: [TasteService],
})
export class TasteModule {}
