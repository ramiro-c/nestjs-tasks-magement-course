import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '../src/auth/user.entity';
import { TaskStatus } from '../src/tasks/task-status.enum';
import { TasksRepository } from '../src/tasks/tasks.repository';
import { TasksService } from '../src/tasks/tasks.service';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
});

const mockUser: User = {
  id: 'abcd123',
  username: 'username_',
  password: 'SomePassword123',
  tasks: [],
};

const mockTask = {
  id: 'abcd123',
  title: 'Test title',
  description: 'Test description',
  status: TaskStatus.OPEN,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      expect(tasksRepository.getTasks).not.toHaveBeenCalled();

      tasksRepository.getTasks.mockResolvedValue('tasks');
      const result = await tasksService.getTasks(null, mockUser);

      expect(tasksRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('tasks');
    });
  });

  describe('getTasksById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      tasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(mockTask.id, mockUser);

      expect(result).toEqual(mockTask);
    });
    it('calls TasksRepository.findOne and handles an error', async () => {
      tasksRepository.findOne.mockResolvedValue(null);

      expect(
        tasksService.getTaskById(mockTask.id, mockUser),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
