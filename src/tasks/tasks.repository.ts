import { InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  private readonly logger: Logger = new Logger(TasksRepository.name, {
    timestamp: true,
  });

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    try {
      const newTask: Task = this.create({
        status: TaskStatus.OPEN,
        ...createTaskDto,
        user,
      });

      await this.save(newTask);

      return newTask;
    } catch (e) {
      this.logger.error(
        `Error creating the task: ${JSON.stringify(createTaskDto)}`,
        e.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const query = this.createQueryBuilder('task');
    query.where({ user });

    const { status, search } = filterDto;
    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        new Brackets(qb => {
          qb.where('title ILIKE :search OR description ILIKE :search', {
            search: `%${search.trim()}%`,
          });
        }),
      );
    }
    try {
      return await query.getMany();
    } catch (e) {
      this.logger.error(
        `Error getting tasks with filters: ${JSON.stringify(filterDto)}`,
        e.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
