import { PaginatedResponse } from '@/common/types/paginated-response';
import { PosterInfo } from '@/images/poster';
import { ApiProperty } from '@nestjs/swagger';

export class PosterResDto extends PaginatedResponse<PosterInfo> {
  @ApiProperty({ type: [PosterInfo] })
  declare results: PosterInfo[];
}
