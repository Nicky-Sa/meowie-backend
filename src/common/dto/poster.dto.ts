import { PaginatedResponse } from '../types/paginated-response';
import { PosterInfo } from '../../types/poster';
import { ApiProperty } from '@nestjs/swagger';

export class PosterResDto extends PaginatedResponse<PosterInfo> {
  @ApiProperty({ type: [PosterInfo] })
  declare results: PosterInfo[];
}
