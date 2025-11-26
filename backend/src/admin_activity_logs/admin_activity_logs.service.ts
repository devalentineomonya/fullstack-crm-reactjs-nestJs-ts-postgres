import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOptionsWhere,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Admin } from '../admins/entities/admin.entity';
import { CreateAdminActivityLogDto } from './dto/create-admin_activity_log.dto';
import { FilterAdminLogsDto } from './dto/filter-admin-logs.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AdminActivityLog } from './entities/admin_activity_log.entity';

@Injectable()
export class AdminActivityLogsService {
  constructor(
    @InjectRepository(AdminActivityLog)
    private readonly logRepository: Repository<AdminActivityLog>,
  ) {}

  async createLog(
    admin: Admin,
    createAdminActivityLogDto: CreateAdminActivityLogDto,
  ): Promise<AdminActivityLog> {
    const log = this.logRepository.create({
      ...createAdminActivityLogDto,
      admin,
    });
    return this.logRepository.save(log);
  }

  async getAdminLogs(adminId: string): Promise<AdminActivityLog[]> {
    return this.logRepository.find({
      where: { admin: { admin_id: adminId } },
      order: { action_time: 'DESC' },
      take: 100,
      relations: ['admin'],
    });
  }

  async getRecentLogs(days = 7): Promise<AdminActivityLog[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.logRepository.find({
      where: { action_time: MoreThanOrEqual(date) },
      order: { action_time: 'DESC' },
      relations: ['admin'],
      take: 100,
    });
  }

  async getLogsByActionType(
    actionType: string,
    limit = 100,
  ): Promise<AdminActivityLog[]> {
    return this.logRepository.find({
      where: { action_type: actionType },
      order: { action_time: 'DESC' },
      relations: ['admin'],
      take: limit,
    });
  }

  async getAllLogs(
    paginationDto: PaginationDto,
    filterDto: FilterAdminLogsDto,
  ): Promise<{ logs: AdminActivityLog[]; count: number }> {
    const {
      search,
      adminId,
      actionType,
      targetEntity,
      targetId,
      startDate,
      endDate,
      ipAddress,
    } = filterDto;

    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AdminActivityLog> = {};

    if (filterDto) {
      if (search) {
        where.action_type = Like(`%${search}%`);
      }

      if (adminId) {
        where.admin = { admin_id: adminId };
      }
      if (actionType) {
        where.action_type = actionType;
      }
      if (targetEntity) {
        where.target_entity = targetEntity;
      }

      if (targetId) {
        where.target_id = targetId;
      }

      if (startDate || endDate) {
        where.action_time = Between(
          startDate || new Date(0),
          endDate || new Date(),
        );
      }

      if (ipAddress) {
        where.ip_address = Like(`%${ipAddress}%`);
      }
    }

    const options: FindManyOptions<AdminActivityLog> = {
      where,
      relations: ['admin'],
      order: { action_time: 'DESC' },
      skip,
      take: limit,
    };

    const [logs, count] = await this.logRepository.findAndCount(options);
    return { logs, count };
  }
}
