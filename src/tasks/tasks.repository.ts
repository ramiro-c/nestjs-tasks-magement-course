import { filter } from 'rxjs';
import { User } from 'src/auth/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const newTask: Task = this.create({
      status: TaskStatus.OPEN,
      ...createTaskDto,
      user,
    });

    await this.save(newTask);

    return newTask;
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

    return await query.getMany();
  }
}
