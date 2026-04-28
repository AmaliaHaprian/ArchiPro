import type { Project } from '../models/Project';

const OFFLINE_PROJECTS_KEY = 'offlineProjects';
const OFFLINE_PROJECT_ID_KEY = 'offlineProjectIdCounter';
const PAGE_SIZE = 5;

type ProjectQuery = {
  userId?: string;
  title?: string;
  category?: string;
  status?: string;
  page?: number;
};

function readProjects(): Project[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(OFFLINE_PROJECTS_KEY) || '[]') as Project[];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(OFFLINE_PROJECTS_KEY, JSON.stringify(projects));
}

export function getOfflineProjects(): Project[] {
  return readProjects();
}

export function getOfflineProjectById(projectId: string): Project | undefined {
  return readProjects().find(project => project.id === projectId);
}

export function upsertOfflineProject(project: Project): Project {
  const projects = readProjects();
  const index = projects.findIndex(existing => existing.id === project.id);

  if (index === -1) {
    projects.unshift(project);
  } else {
    projects[index] = project;
  }

  writeProjects(projects);
  return project;
}

export function removeOfflineProject(projectId: string): void {
  const projects = readProjects().filter(project => project.id !== projectId);
  writeProjects(projects);
}

function normalizeText(value?: string): string {
  return (value || '').trim().toLowerCase();
}

function matchesQuery(project: Project, query: ProjectQuery): boolean {
  if (query.userId && project.userId !== query.userId) {
    return false;
  }

  if (query.title && !project.title.toLowerCase().includes(normalizeText(query.title))) {
    return false;
  }

  if (query.category && project.category !== query.category) {
    return false;
  }

  if (query.status && project.status !== query.status) {
    return false;
  }

  return true;
}

export function queryOfflineProjects(query: ProjectQuery): Project[] {
  const filteredProjects = readProjects().filter(project => matchesQuery(project, query));

  if (!query.page) {
    return filteredProjects;
  }

  const startIndex = (query.page - 1) * PAGE_SIZE;
  return filteredProjects.slice(startIndex, startIndex + PAGE_SIZE);
}

export function paginateOfflineProjects(page: number): Project[] {
  const startIndex = (page - 1) * PAGE_SIZE;
  return readProjects().slice(startIndex, startIndex + PAGE_SIZE);
}

export function createLocalProject(project: Partial<Project> & { userId: string; title: string; category: Project['category']; description: string; startDate: string; endDate: string; }): Project {
  const now = new Date().toISOString();
  const currentCounter = Number(localStorage.getItem(OFFLINE_PROJECT_ID_KEY) || '1000000');
  const nextCounter = Number.isNaN(currentCounter) ? 1000000 : currentCounter;
  localStorage.setItem(OFFLINE_PROJECT_ID_KEY, String(nextCounter + 1));

  return {
    id: String(nextCounter),
    userId: project.userId,
    title: project.title,
    status: 'Planning',
    category: project.category,
    progress: 0,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: now,
    updatedAt: now,
    currentStage: 'PROJECT_BRIEF',
    workingHours: 0,
    stageData: project.stageData,
  } as Project;
}

export function mergeOfflineProject(existingProject: Project | undefined, projectId: string, updatedData: any): Project {
  const now = new Date().toISOString();
  const payload = updatedData?.project ?? updatedData;
  const mergedProject = {
    ...(existingProject || {}),
    ...(payload || {}),
    id: projectId,
    createdAt: existingProject?.createdAt || now,
    updatedAt: now,
  } as Project;

  if (!mergedProject.status) {
    mergedProject.status = existingProject?.status || 'Planning';
  }

  if (mergedProject.progress === undefined || mergedProject.progress === null) {
    mergedProject.progress = existingProject?.progress || 0;
  }

  return mergedProject;
}
