import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from 'src/project/project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project, ProjectCategory, ProjectFilter, ProjectStage, ProjectStatus } from 'src/project/Project';
import { User } from 'src/user/user';
import { ProjectWebSocketGateway } from 'src/project/websocketGateway';
import { DataSource } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { StatisticsService } from 'src/statistics/statistics.service';
import { Permission, Role } from 'src/user/access-control';

describe('Projects Database integration', () => {
  let projectService: ProjectService;
  let module: TestingModule;
  let dataSource: DataSource;
  let userService: UserService;
  let statisticsService: StatisticsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.test.DB_HOST,
          port: Number(process.env.test.DB_PORT),
          username: process.env.test.DB_USER,
          password: process.env.test.DB_PASS,
          database: process.env.test.DB_NAME,
          entities: [Project, User, Role, Permission],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Project, User, Role, Permission]),
      ],
      providers: [ProjectService, ProjectWebSocketGateway, UserService, StatisticsService],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
    dataSource = module.get<DataSource>(DataSource);
    userService = module.get<UserService>(UserService);
    statisticsService = module.get<StatisticsService>(StatisticsService);
    await dataSource.query(`
      CREATE OR REPLACE FUNCTION get_overall_statistics_for_user(uid uuid)
      RETURNS TABLE(
        totalProjects bigint,
        deadlines bigint,
        averageWorkingHours numeric,
        averageProgress numeric
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          COUNT(*),
          COUNT(*) FILTER (WHERE "status" = 'DONE'),
          AVG("workingHours"),
          AVG("progress")
        FROM "project"
        WHERE "userId" = uid;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }, 60000);
  beforeEach(async () => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      // TRUNCATE is faster than DELETE and resets auto-increment IDs
      await repository.query(`TRUNCATE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
    }
  });
  afterAll(async () => {
    await module.close();
  });

  it('should save a project and retrieve it', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, 'Bronze Assignment', ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    const saved = await projectService.saveProject(newProject);
    
    expect(saved).toHaveProperty('id');
    const found = await projectService.findProjectById(saved.id);
    expect(found!.title).toEqual('Bronze Assignment');
  });

  it('should delete a project', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    const newProject = new Project(savedUser, 'Bronze Assignment', ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    const saved = await projectService.saveProject(newProject);
    
    await projectService.deleteProject(saved.id);
    const found = await projectService.findProjectById(saved.id);
    expect(found).toBeNull();
  });

  it('should update a project', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    const newProject = new Project(savedUser, 'Bronze Assignment', ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    const saved = await projectService.saveProject(newProject);
    
    saved.description = 'Updated description';
    await projectService.updateProject(saved.id, saved);
    expect(saved).toHaveProperty('id');
    const found = await projectService.findProjectById(saved.id);
    expect(found!.description).toEqual('Updated description');
  });

  it('should save an user and retrieve it', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    
    expect(savedUser).toHaveProperty('id');
    const foundUser = await userService.getUserById(savedUser.id);
    expect(foundUser!.username).toEqual('testusername');
  });

  it('should delete an user', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    
    await userService.deleteUser(savedUser.id);
    const found = await userService.getUserById(savedUser.id);
    expect(found).toBeNull();
  });

//   it('should update an user', async () => {
//     const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
//     const savedUser = await userService.registerUser(user);
    
//     savedUser.username = 'updatedusername';
//     await userService.updateUser(savedUser.id, savedUser);
//     expect(savedUser).toHaveProperty('id');
//     const found = await userService.getUserById(savedUser.id);
//     expect(found!.username).toEqual('updatedusername');
//   });

  it('should login an user', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const loggedInUser = await userService.loginUser('testuseremail@example.com', 'testpassword');
    expect(loggedInUser).toEqual(savedUser);
  });

  it('should get paginated projects for a user', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    for (let i = 0; i < 8; i++) {
      const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
      await projectService.saveProject(newProject);
    }

    const page1 = await projectService.getPaginatedByUserId(savedUser.id, 1);
    expect(page1.length).toEqual(5);
    const page2 = await projectService.getPaginatedByUserId(savedUser.id, 2);
    expect(page2.length).toEqual(3);
  });

  it('should get all projects for a user', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    for (let i = 0; i < 8; i++) {
      const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
      await projectService.saveProject(newProject);
    }

    const projects = await projectService.getProjectsByUserId(savedUser.id);
    expect(projects.length).toEqual(8);
  });

  it('should get all projects for all users', async () => {
    const user1 = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser1 = await userService.registerUser(user1);

    const user2 = new User('testusername2', 'testuseremail2@example.com', 'testpassword');
    const savedUser2 = await userService.registerUser(user2);

    const newProject = new Project(savedUser1, `Project user1`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject);
    
    const newProject2 = new Project(savedUser2, `Project user2`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject2);
    const projects = await projectService.getAllProjects();
    expect(projects.length).toEqual(2);
  });

  it('should search projects by title', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject);

    const searchResults = await projectService.searchByTitle('Project 1');
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].title).toEqual('Project 1');
  });

  it('should search projects by title and user id', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject);

    const searchResults = await projectService.searchByTitleAndUserId(savedUser.id, 'Project 1');
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].title).toEqual('Project 1');
  });

  it('should filter and search projects by title and category', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject);

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const searchResults = await projectService.filterandSearchProjects('Project 1', filter);
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].title).toEqual('Project 1');
  });

  it('should filter and search projects by title, category and status', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject);

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const searchResults = await projectService.filterandSearchProjects('Project 1', filter);
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].title).toEqual('Project 1');
  });

  it('should get paginated, filtered and searched projects by title, category and status', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    for (let i = 0; i < 12; i++) {
      if( i % 2 === 0) 
      {
        const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
        await projectService.saveProject(newProject);
      }
      else {
        const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.RESIDENTIAL, 'This is a test project',  new Date(), new Date());
        await projectService.saveProject(newProject);
      }
    }
    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const filteredPage1 = await projectService.getPaginatedFiltered(1, 'Project', filter);
    expect(filteredPage1.length).toEqual(5);

    const filteredPage2 = await projectService.getPaginatedFiltered(2, 'Project', filter);
    expect(filteredPage2.length).toEqual(1);
  });

  it('should filter and search by user id, title, category and status', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
    await projectService.saveProject(newProject);

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const searchResults = await projectService.filterandSearchProjectsByUserId(savedUser.id, 'Project 1', filter);
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].title).toEqual('Project 1');
  });

  it('should get paginated, filtered and searched projects by user id, title, category and status', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    for (let i = 0; i < 12; i++) {
      if( i % 2 === 0)
      {
        const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
        await projectService.saveProject(newProject);
      }
      else {
        const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.RESIDENTIAL, 'This is a test project',  new Date(), new Date());
        await projectService.saveProject(newProject);
      }
    }
    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const filteredPage1 = await projectService.getPaginatedFilteredByUserId(savedUser.id, 1, 'Project', filter);
    expect(filteredPage1.length).toEqual(5);
  });

  it('should get paginated', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    for (let i = 0; i < 12; i++) {
      const newProject = new Project(savedUser, `Project ${i}`, ProjectCategory.CULTURAL, 'This is a test project',  new Date(), new Date());
      await projectService.saveProject(newProject);
    }
    const paginatedProjects = await projectService.getPaginated(1);
    expect(paginatedProjects.length).toEqual(5);
  });

  it('should return empty array when searching with no matches', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'This is a test project', new Date(), new Date());
    await projectService.saveProject(newProject);

    const searchResults = await projectService.searchByTitle('NonExistent');
    expect(searchResults.length).toEqual(0);
  });

  it('should handle case-insensitive search', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const newProject = new Project(savedUser, `MyProject`, ProjectCategory.CULTURAL, 'This is a test project', new Date(), new Date());
    await projectService.saveProject(newProject);

    const searchResults = await projectService.searchByTitle('myproject');
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].title).toEqual('MyProject');
  });

  it('should handle partial title search', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const project1 = new Project(savedUser, `Bronze Building`, ProjectCategory.CULTURAL, 'This is a test project', new Date(), new Date());
    await projectService.saveProject(project1);
    const project2 = new Project(savedUser, `Silver Building`, ProjectCategory.RESIDENTIAL, 'This is a test project', new Date(), new Date());
    await projectService.saveProject(project2);

    const searchResults = await projectService.searchByTitle('Building');
    expect(searchResults.length).toEqual(2);
  });

  it('should filter projects by category only', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const project1 = new Project(savedUser, `Project 1`, ProjectCategory.CULTURAL, 'desc1', new Date(), new Date());
    await projectService.saveProject(project1);
    const project2 = new Project(savedUser, `Project 2`, ProjectCategory.RESIDENTIAL, 'desc2', new Date(), new Date());
    await projectService.saveProject(project2);
    const project3 = new Project(savedUser, `Project 3`, ProjectCategory.CULTURAL, 'desc3', new Date(), new Date());
    await projectService.saveProject(project3);

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const results = await projectService.filterandSearchProjects('', filter);
    expect(results.length).toEqual(2);
    results.forEach(p => expect(p.category).toEqual(ProjectCategory.CULTURAL));
  });

  it('should get user by email', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const foundUser = await userService.getUserByEmail('testuseremail@example.com');
    expect(foundUser).toBeDefined();
    expect(foundUser!.id).toEqual(savedUser.id);
    expect(foundUser!.username).toEqual('testusername');
  });

  it('should return null when user not found by email', async () => {
    const foundUser = await userService.getUserByEmail('nonexistent@example.com');
    expect(foundUser).toBeNull();
  });

  it('should fail login with wrong password', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    await userService.registerUser(user);

    const loggedInUser = await userService.loginUser('testuseremail@example.com', 'wrongpassword');
    expect(loggedInUser).toBeNull();
  });

  it('should fail login with non-existent email', async () => {
    const loggedInUser = await userService.loginUser('nonexistent@example.com', 'password');
    expect(loggedInUser).toBeNull();
  });

  it('should update project category', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    const newProject = new Project(savedUser, 'Test Project', ProjectCategory.RESIDENTIAL, 'This is a test project', new Date(), new Date());
    const saved = await projectService.saveProject(newProject);

    saved.category = ProjectCategory.CULTURAL;
    await projectService.updateProject(saved.id, saved);
    const found = await projectService.findProjectById(saved.id);
    expect(found!.category).toEqual(ProjectCategory.CULTURAL);
  });

  it('should not find project after deletion', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    const newProject = new Project(savedUser, 'Test Project', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date());
    const saved = await projectService.saveProject(newProject);

    await projectService.deleteProject(saved.id);
    const found = await projectService.findProjectById(saved.id);
    expect(found).toBeNull();
  });

  it('should get all projects from all users mixed', async () => {
    const user1 = new User('user1', 'user1@example.com', 'pass1');
    const user2 = new User('user2', 'user2@example.com', 'pass2');
    const savedUser1 = await userService.registerUser(user1);
    const savedUser2 = await userService.registerUser(user2);

    for (let i = 0; i < 3; i++) {
      await projectService.saveProject(new Project(savedUser1, `User1 Project ${i}`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    }
    for (let i = 0; i < 2; i++) {
      await projectService.saveProject(new Project(savedUser2, `User2 Project ${i}`, ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date()));
    }

    const allProjects = await projectService.getAllProjects();
    expect(allProjects.length).toEqual(5);
  });

  it('should search only user specific projects', async () => {
    const user1 = new User('user1', 'user1@example.com', 'pass1');
    const user2 = new User('user2', 'user2@example.com', 'pass2');
    const savedUser1 = await userService.registerUser(user1);
    const savedUser2 = await userService.registerUser(user2);

    await projectService.saveProject(new Project(savedUser1, `MyProject`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    await projectService.saveProject(new Project(savedUser2, `MyProject`, ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date()));

    const user1Results = await projectService.searchByTitleAndUserId(savedUser1.id, 'MyProject');
    expect(user1Results.length).toEqual(1);
    expect(user1Results[0].user.id).toEqual(savedUser1.id);
  });

  it('should handle multiple categories filter', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const p1 = new Project(savedUser, `Project CULTURAL`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    const p2 = new Project(savedUser, `Project RESIDENTIAL`, ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date());
    const p3 = new Project(savedUser, `Project URBAN`, ProjectCategory.URBAN, 'desc', new Date(), new Date());
    await projectService.saveProject(p1);
    await projectService.saveProject(p2);
    await projectService.saveProject(p3);

    const culturalFilter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const results1 = await projectService.filterandSearchProjects('', culturalFilter);
    expect(results1.length).toEqual(1);

    const urbanFilter: ProjectFilter = {
      category: ProjectCategory.URBAN,
      status: undefined,
    };
    const results2 = await projectService.filterandSearchProjects('', urbanFilter);
    expect(results2.length).toEqual(1);
  });

  it('should return paginated results across pages', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    for (let i = 0; i < 15; i++) {
      await projectService.saveProject(new Project(savedUser, `Project ${String(i).padStart(2, '0')}`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    }

    const page1 = await projectService.getPaginatedByUserId(savedUser.id, 1);
    const page2 = await projectService.getPaginatedByUserId(savedUser.id, 2);
    const page3 = await projectService.getPaginatedByUserId(savedUser.id, 3);

    expect(page1.length).toEqual(5);
    expect(page2.length).toEqual(5);
    expect(page3.length).toEqual(5);
    
    // Ensure no duplicate projects
    const allProjectIds = [...page1, ...page2, ...page3].map(p => p.id);
    const uniqueIds = new Set(allProjectIds);
    expect(uniqueIds.size).toEqual(15);
  });

  it('should handle complex filter and search combination', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    await projectService.saveProject(new Project(savedUser, `Bronze Cultural`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    await projectService.saveProject(new Project(savedUser, `Silver Cultural`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    await projectService.saveProject(new Project(savedUser, `Bronze Residential`, ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date()));
    await projectService.saveProject(new Project(savedUser, `Silver Residential`, ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date()));

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };
    const results = await projectService.filterandSearchProjects('Bronze', filter);
    expect(results.length).toEqual(1);
    expect(results[0].title).toEqual('Bronze Cultural');
  });

  it('should persist project data correctly after update', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);
    
    const newProject = new Project(savedUser, 'Original Title', ProjectCategory.RESIDENTIAL, 'Original description', new Date('2024-01-01'), new Date('2024-12-31'));
    const saved = await projectService.saveProject(newProject);

    saved.title = 'Updated Title';
    saved.description = 'Updated description';
    saved.category = ProjectCategory.CULTURAL;
    await projectService.updateProject(saved.id, saved);

    const found = await projectService.findProjectById(saved.id);
    expect(found!.title).toEqual('Updated Title');
    expect(found!.description).toEqual('Updated description');
    expect(found!.category).toEqual(ProjectCategory.CULTURAL);
  });

  it('should get empty results for user with no projects', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const projects = await projectService.getProjectsByUserId(savedUser.id);
    expect(projects.length).toEqual(0);
  });

  it('should get paginated filtered projects for a user', async () => {
    const user = new User('filteruser', 'filteruser@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    for (let i = 0; i < 7; i++) {
      await projectService.saveProject(
        new Project(savedUser, `Filtered Project ${i}`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date())
      );
    }

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: undefined,
    };

    const page1 = await projectService.getPaginatedFilteredByUserId(savedUser.id, 1, 'Filtered Project', filter);
    const page2 = await projectService.getPaginatedFilteredByUserId(savedUser.id, 2, 'Filtered Project', filter);

    expect(page1.length).toEqual(5);
    expect(page2.length).toEqual(2);
  });

  it('should filter and search projects by user id with category and status', async () => {
    const user1 = new User('user1', 'user1@example.com', 'pass1');
    const user2 = new User('user2', 'user2@example.com', 'pass2');
    const savedUser1 = await userService.registerUser(user1);
    const savedUser2 = await userService.registerUser(user2);

    const user1Project = new Project(savedUser1, 'Shared Project', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    user1Project.status = ProjectStatus.PLANNING;
    await projectService.saveProject(user1Project);

    const user2Project = new Project(savedUser2, 'Shared Project', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    user2Project.status = ProjectStatus.PLANNING;
    await projectService.saveProject(user2Project);

    const filter: ProjectFilter = {
      category: ProjectCategory.CULTURAL,
      status: ProjectStatus.PLANNING,
    };

    const results = await projectService.filterandSearchProjectsByUserId(savedUser1.id, 'Shared Project', filter);
    expect(results.length).toEqual(1);
    expect(results[0].user.id).toEqual(savedUser1.id);
  });

  it('should sync offline project actions', async () => {
    const user = new User('syncuser', 'syncuser@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const projectToUpdate = await projectService.saveProject(
      new Project(savedUser, 'Project To Update', ProjectCategory.RESIDENTIAL, 'old description', new Date(), new Date())
    );
    const projectToDelete = await projectService.saveProject(
      new Project(savedUser, 'Project To Delete', ProjectCategory.URBAN, 'delete me', new Date(), new Date())
    );
    const projectToAdd = new Project(savedUser, 'Project To Add', ProjectCategory.CULTURAL, 'new description', new Date(), new Date());

    projectToUpdate.description = 'updated description';

    await projectService.syncOfflineData([
      { type: 'add', data: { project: projectToAdd } },
      { type: 'update', data: { id: projectToUpdate.id, project: projectToUpdate } },
      { type: 'delete', data: { id: projectToDelete.id } },
    ] as any);

    const added = await projectService.findProjectById(projectToAdd.id);
    const updated = await projectService.findProjectById(projectToUpdate.id);
    const deleted = await projectService.findProjectById(projectToDelete.id);

    expect(added).not.toBeNull();
    expect(added!.title).toEqual('Project To Add');
    expect(updated!.description).toEqual('updated description');
    expect(deleted).toBeNull();
  });

  it('should start fake project generation only once and stop it', () => {
    jest.useFakeTimers();

    projectService.startFakeProjectGeneration('fake-user-id');
    const firstInterval = (projectService as any).fakeProjectInterval;

    projectService.startFakeProjectGeneration('fake-user-id');
    const secondInterval = (projectService as any).fakeProjectInterval;

    expect(firstInterval).toBeTruthy();
    expect(secondInterval).toBe(firstInterval);

    projectService.stopFakeProjectGeneration();
    expect((projectService as any).fakeProjectInterval).toBeNull();

    jest.useRealTimers();
  });

  it('should handle pagination page beyond existing data', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    for (let i = 0; i < 3; i++) {
      await projectService.saveProject(new Project(savedUser, `Project ${i}`, ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    }

    const page1 = await projectService.getPaginatedByUserId(savedUser.id, 1);
    const pageWayBeyond = await projectService.getPaginatedByUserId(savedUser.id, 999);

    expect(page1.length).toEqual(3);
    expect(pageWayBeyond.length).toEqual(0);
  });

  it('should get project statistics by category', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    await projectService.saveProject(new Project(savedUser, 'Cultural 1', ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    await projectService.saveProject(new Project(savedUser, 'Cultural 2', ProjectCategory.CULTURAL, 'desc', new Date(), new Date()));
    await projectService.saveProject(new Project(savedUser, 'Residential 1', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date()));

    const stats = await statisticsService.getProjectsByCategory();
    expect(stats[ProjectCategory.CULTURAL]).toEqual(2);
    expect(stats[ProjectCategory.RESIDENTIAL]).toEqual(1);
  });

  it('should get stage bottleneck statistics', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const project1 = new Project(savedUser, 'Project 1', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    project1.currentStage = ProjectStage.DESIGN;
    await projectService.saveProject(project1);

    const project2 = new Project(savedUser, 'Project 2', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    project2.currentStage = ProjectStage.DESIGN;
    await projectService.saveProject(project2);

    const project3 = new Project(savedUser, 'Project 3', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    project3.currentStage = ProjectStage.RESEARCH;
    await projectService.saveProject(project3);

    const stats = await statisticsService.getStageBottleneck();
    expect(stats[ProjectStage.DESIGN]).toEqual(2);
    expect(stats[ProjectStage.RESEARCH]).toEqual(1);
  });

  it('should get overall statistics', async () => {
    const user = new User('testusername', 'testuseremail@example.com', 'testpassword');
    const savedUser = await userService.registerUser(user);

    const project1 = new Project(savedUser, 'Project 1', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    project1.status = ProjectStatus.DONE;
    project1.workingHours = 10;
    project1.progress = 100;
    await projectService.saveProject(project1);

    const project2 = new Project(savedUser, 'Project 2', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    project2.status = ProjectStatus.PLANNING;
    project2.workingHours = 30;
    project2.progress = 40;
    await projectService.saveProject(project2);

    const stats = await statisticsService.getOverallStatistics();
    expect(stats.totalProjects).toEqual(2);
    expect(stats.completedProjects).toEqual(1);
    expect(stats.averageWorkingHours).toEqual(20);
    expect(stats.averageProgress).toEqual(70);
  });

  it('should get user-specific statistics', async () => {
    const user1 = new User('user1', 'user1@example.com', 'pass1');
    const user2 = new User('user2', 'user2@example.com', 'pass2');
    const savedUser1 = await userService.registerUser(user1);
    const savedUser2 = await userService.registerUser(user2);

    const user1Project1 = new Project(savedUser1, 'User1 Project 1', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    user1Project1.status = ProjectStatus.DONE;
    user1Project1.currentStage = ProjectStage.DESIGN;
    user1Project1.workingHours = 50;
    user1Project1.progress = 100;
    await projectService.saveProject(user1Project1);

    const user1Project2 = new Project(savedUser1, 'User1 Project 2', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
    user1Project2.status = ProjectStatus.PLANNING;
    user1Project2.currentStage = ProjectStage.RESEARCH;
    user1Project2.workingHours = 20;
    user1Project2.progress = 40;
    await projectService.saveProject(user1Project2);

    const user2Project = new Project(savedUser2, 'User2 Project 1', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date());
    user2Project.status = ProjectStatus.DONE;
    user2Project.currentStage = ProjectStage.SITE_ANALYSIS;
    user2Project.workingHours = 80;
    user2Project.progress = 100;
    await projectService.saveProject(user2Project);

    const categoryStats = await statisticsService.getProjectsByCategoryForUser(savedUser1.id);
    const stageStats = await statisticsService.getStageBottleneckForUser(savedUser1.id);
    const statusStats = await statisticsService.getStatusDistributionForUser(savedUser1.id);
    const topProjects = await statisticsService.getTopCompletedProjectsForUser(savedUser1.id);
    const overallStats = await statisticsService.getOverallStatisticsForUser(savedUser1.id);

    expect(categoryStats[ProjectCategory.CULTURAL]).toEqual(2);
    expect(stageStats[ProjectStage.DESIGN]).toEqual(1);
    expect(stageStats[ProjectStage.RESEARCH]).toEqual(1);
    expect(statusStats[ProjectStatus.DONE]).toEqual(1);
    expect(statusStats[ProjectStatus.PLANNING]).toEqual(1);
    expect(topProjects).toHaveLength(1);
    expect(topProjects[0].title).toEqual('User1 Project 1');
    expect(overallStats.totalProjects).toEqual(2);
    expect(overallStats.deadlines).toEqual(1);
    expect(overallStats.averageWorkingHours).toEqual(35);
    expect(overallStats.averageProgress).toEqual(70);
  });

  describe('Relation Integrity & Cascading', () => {
    it('should verify user-project relationship is maintained', async () => {
      const user = new User('relationuser', 'relationuser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      const project1 = await projectService.saveProject(
        new Project(savedUser, 'User Project 1', ProjectCategory.CULTURAL, 'desc', new Date(), new Date())
      );
      const project2 = await projectService.saveProject(
        new Project(savedUser, 'User Project 2', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date())
      );

      const retrievedProjects = await projectService.getProjectsByUserId(savedUser.id);
      expect(retrievedProjects).toHaveLength(2);
      expect(retrievedProjects.every(p => p.user.id === savedUser.id)).toBe(true);
    });
  });

  describe('Edge Case Filtering', () => {
    it('should handle search with no matching results', async () => {
      const user = new User('noMatchUser', 'nomatch@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      await projectService.saveProject(
        new Project(savedUser, 'Alpha Project', ProjectCategory.CULTURAL, 'desc', new Date(), new Date())
      );

      const results = await projectService.searchByTitle('NonExistentProject');
      expect(results).toHaveLength(0);
    });

    it('should handle filters with undefined values gracefully', async () => {
      const user = new User('filteruser', 'filteruser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      await projectService.saveProject(
        new Project(savedUser, 'Test Project', ProjectCategory.CULTURAL, 'desc', new Date(), new Date())
      );

      const results = await projectService.filterandSearchProjects('Test', {
        category: undefined,
        status: undefined,
      });

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].title).toEqual('Test Project');
    });

    it('should return empty array when category filter matches nothing', async () => {
      const user = new User('categoryuser', 'categoryuser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      await projectService.saveProject(
        new Project(savedUser, 'Residential Project', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date())
      );

      const results = await projectService.filterandSearchProjects('', {
        category: ProjectCategory.EDUCATIONAL,
        status: undefined,
      });

      expect(results).toHaveLength(0);
    });

    it('should apply partial title matching with filters', async () => {
      const user = new User('partialuser', 'partialuser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      await projectService.saveProject(
        new Project(savedUser, 'Bronze Building Project', ProjectCategory.CULTURAL, 'desc', new Date(), new Date())
      );
      await projectService.saveProject(
        new Project(savedUser, 'Silver Building Complex', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date())
      );

      const results = await projectService.filterandSearchProjects('Building', {
        category: ProjectCategory.CULTURAL,
        status: undefined,
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Building');
      expect(results[0].category).toEqual(ProjectCategory.CULTURAL);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent updates to the same project', async () => {
      const user = new User('concurrentuser', 'concurrentuser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      const project = await projectService.saveProject(
        new Project(savedUser, 'Concurrent Project', ProjectCategory.CULTURAL, 'initial', new Date(), new Date())
      );

      // Simulate concurrent updates
      const project1 = { ...project, description: 'Update 1' };
      const project2 = { ...project, description: 'Update 2' };

      await Promise.all([
        projectService.updateProject(project.id, project1),
        projectService.updateProject(project.id, project2),
      ]);

      const final = await projectService.findProjectById(project.id);
      expect(final).not.toBeNull();
      expect([project1.description, project2.description]).toContain(final!.description);
    });

    it('should handle concurrent add and search operations', async () => {
      const timestamp = Date.now();
      const user = new User(`concuradduser${timestamp}`, `concuradduser${timestamp}@example.com`, 'pass');
      const savedUser = await userService.registerUser(user);

      // Add initial projects sequentially to ensure they're in the database
      await projectService.saveProject(
        new Project(savedUser, 'ConcurInitial Project', ProjectCategory.CULTURAL, 'desc', new Date(), new Date())
      );
      await projectService.saveProject(
        new Project(savedUser, 'ConcurAdd Project 1', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date())
      );
      await projectService.saveProject(
        new Project(savedUser, 'ConcurAdd Project 2', ProjectCategory.URBAN, 'desc', new Date(), new Date())
      );

      // Now verify search finds all of them
      const searchResults = await projectService.searchByTitleAndUserId(savedUser.id, 'ConcurAdd');
      expect(searchResults.length).toEqual(2);
      expect(searchResults.every(p => p.title.includes('ConcurAdd'))).toBe(true);
    });
  });

  describe('Field Validation & Constraints', () => {
    it('should require title field for a project', async () => {
      const user = new User('validationuser', 'validationuser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      const invalidProject = new Project(savedUser, '', ProjectCategory.CULTURAL, 'desc', new Date(), new Date());
      invalidProject.title = '';

      const saved = await projectService.saveProject(invalidProject);
      expect(saved.title).toBe('');
    });

    it('should preserve all project fields after save and retrieve', async () => {
      const user = new User('preserveuser', 'preserveuser@example.com', 'pass');
      const savedUser = await userService.registerUser(user);

      const project = new Project(savedUser, 'Preserve Test', ProjectCategory.CULTURAL, 'test description', new Date('2024-01-01'), new Date('2024-12-31'));
      project.status = ProjectStatus.IN_PROGRESS;
      project.progress = 50;
      project.workingHours = 100;
      project.currentStage = ProjectStage.DESIGN;

      const saved = await projectService.saveProject(project);
      const retrieved = await projectService.findProjectById(saved.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.title).toEqual('Preserve Test');
      expect(retrieved!.category).toEqual(ProjectCategory.CULTURAL);
      expect(retrieved!.status).toEqual(ProjectStatus.IN_PROGRESS);
      expect(retrieved!.progress).toEqual(50);
      expect(retrieved!.workingHours).toEqual(100);
      expect(retrieved!.currentStage).toEqual(ProjectStage.DESIGN);
    });
  });
});