import { ProjectRepository } from './projectRepo';
import { Project, ProjectCategory } from './Project';

describe('ProjectRepository', () => {
  let repo: ProjectRepository;

  beforeEach(() => {
    repo = new ProjectRepository();
  });

  it('should initialize with 4 projects', () => {
    const projects = repo.getAll();
    expect(projects).toHaveLength(4);
  });

  it('should save a new project', () => {
    const project = new Project('Test', ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date());
    repo.save(project);
    expect(repo.getAll()[0]).toBe(project);
  });

  it('should find a project by id', () => {
    const project = repo.getAll()[0];
    const found = repo.findById(project.id);
    expect(found).toBe(project);
  });

  it('should delete a project', () => {
    const project = repo.getAll()[0];
    repo.delete(project.id);
    expect(repo.findById(project.id)).toBeUndefined();
  });

  it('should update a project', () => {
    const project = repo.getAll()[0];
    const updated = new Project('Updated', ProjectCategory.URBAN, 'updated desc', new Date(), new Date());
    repo.update(project.id, updated);
    const found = repo.findById(project.id);
    expect(found?.category).toBe(ProjectCategory.URBAN);
    expect(found?.description).toBe('updated desc');
  });

  it('should return paginated projects', () => {
    const page1 = repo.getPaginated(1);
    expect(page1).toHaveLength(4);
    const page2 = repo.getPaginated(2);
    expect(page2.length).toBe(0);   
  });
});
