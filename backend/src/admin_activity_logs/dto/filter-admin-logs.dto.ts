import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAdminLogsDto {
  @ApiPropertyOptional({ description: 'Search term for filtering logs' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'ID of the admin' })
  @IsOptional()
  @IsString()
  adminId?: string;

  @ApiPropertyOptional({ description: 'Type of action performed' })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiPropertyOptional({ description: 'Target entity involved in the action' })
  @IsOptional()
  @IsString()
  targetEntity?: string;

  @ApiPropertyOptional({ description: 'ID of the target entity' })
  @IsOptional()
  @IsNumber()
  targetId?: number;

  @ApiPropertyOptional({ description: 'Start date for filtering logs' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering logs' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'IP address of the admin' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
