import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.tsx'
import Overview from './pages/Overview.tsx'
import AddProject from './pages/AddProject.tsx'
import type { Project } from './models/Project.tsx'
import { useState } from 'react'
import ProjectPage from './pages/ProjectPage.tsx'
import EditPage from './pages/EditPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import type { User } from './models/User.tsx'
import StatisticsPage from './pages/StatisticsPage.tsx'
import SiteAnalysisPage from './pages/ProjectVisualizationPage.tsx'
import ResearchPage from './pages/ResearchPage.tsx'
import DesignPage from './pages/DesignPage.tsx'
import ShadowPath from './pages/ShadowPath.tsx'
function App() {

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([{
    id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
    projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
    projectStartDate: '2024-01-15',
    projectDueDate: '2025-12-31',
    projectCreatedAt: '2024-01-10T10:00:00Z',
    projectUpdatedAt: '2024-06-01T15:30:00Z',
  },
        {
          id: '2', projectName: 'Urban Park', projectStatus: 'Done', projectCategory: 'Landscape', projectProgres: 100,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '',
          projectUpdatedAt: '',
          projectCurrentStage: 'Project brief',
        },
        {
          id: '3', projectName: 'Modern Art Gallery', projectStatus: 'Planning', projectCategory: 'Urban', projectProgres: 0,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '',
          projectUpdatedAt: '',
          projectCurrentStage: 'Site analysis',
        },
        {
          id: '4', projectName: 'Creative Hub', projectStatus: 'In progress', projectCategory: 'Mixed-use', projectProgres: 45,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '',
          projectUpdatedAt: '',
          projectCurrentStage: 'Design',

        },
        {
          id: '5', projectName: 'Riverfront Homes', projectStatus: 'Planning', projectCategory: 'Residential', projectProgres: 10,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '',
          projectUpdatedAt: '',
          projectCurrentStage: 'Research',
        },
        {
          id: '6', projectName: 'Science Museum', projectStatus: 'Done', projectCategory: 'Cultural', projectProgres: 100,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '',
          projectUpdatedAt: '',
          projectCurrentStage: 'Visualization',
        },
        {
          id: '7', projectName: 'Metro Station', projectStatus: 'In progress', projectCategory: 'Infrastructure', projectProgres: 72,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '',
          projectUpdatedAt: '',
          projectCurrentStage: 'Site analysis',
        },]);

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
  }

  const deleteProject = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  }
  
  const updateProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  }

  const registerUser = (user: User) => {
    setUsers([...users, user]);
  }

  const loginUser = (username: string, password: string) => {
    const user = users.find((u) => u.username === username && u.password === password);
    return user ? user : null;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/overview" element={<Overview projects={projects} />} />
      <Route path="/addproject" element={<AddProject onAddProject={addProject} />} />
      <Route path="/project/:id" element={<ProjectPage projects={projects} onDeleteProject={deleteProject} onUpdateProject={updateProject}/>} />
      <Route path="/project/:projectId/site-analysis" element={<SiteAnalysisPage projects={projects} updateProject={updateProject}/>} />
      <Route path="/project/:projectId/research" element={<ResearchPage projects={projects} updateProject={updateProject}/>} />
      <Route path="/project/:projectId/design" element={<DesignPage projects={projects} updateProject={updateProject}/>} />
      <Route path="/edit/:id" element={<EditPage projects={projects} onUpdateProject={updateProject}/>} />
      <Route path="/register" element={<RegisterPage onRegisterUser={registerUser} />} />
      <Route path="/login" element={<LoginPage onLoginUser={loginUser} />} />
      <Route path="/statistics" element={<StatisticsPage projects={projects} />} />
      <Route path="/project/:projectId/shadow-path" element={<ShadowPath projects={projects} />} />
    </Routes>
  )
}

export default App
