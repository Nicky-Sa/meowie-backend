import { IsNotEmpty, IsNumber } from 'class-validator';

export class ToggleSaveReqDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class ToggleSaveResDto {
  saved: boolean;
}
