import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.tsx'
import Overview from './pages/Overview.tsx'
import AddProject from './pages/AddProject.tsx'
import type { Project } from "./models/Project.jsx"
import { useEffect, useState } from 'react'
import ProjectPage from './pages/ProjectPage.tsx'
import EditPage from './pages/EditPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import type { User } from './models/User.tsx'
import SiteAnalysisPage from './pages/ProjectVisualizationPage.tsx'
import ResearchPage from './pages/ResearchPage.tsx'
import DesignPage from './pages/DesignPage.tsx'
import ShadowPath from './pages/ShadowPath.tsx'
import ChatPage from './pages/ChatPage.tsx'
import ObservationPage from './pages/ObservationPage.tsx'
import UnauthorizedPage from './pages/UnauthorizedPage.tsx'
import TotpSetupPage from './pages/TotpSetupPage.tsx'
import WebAuthnSetupPage from './pages/WebAuthnSetupPage.tsx'
import { syncQueuedActions } from './api.ts'
import { useNetworkStatus } from './hooks/useNetworkStatus.ts'
import { clearQueuedActions, getQueuedActions } from './hooks/useNetworkStatus.ts'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx'

function App() {
  const isOnline  = useNetworkStatus();
    
    useEffect(() => {
    if (!isOnline) {
      console.log('[SYNC] Skipped: client is offline');
      return;
    }

    let cancelled = false;

    const attemptSync = async () => {
      const queuedActions = getQueuedActions();
      if (queuedActions.length === 0 || cancelled) {
        if (!cancelled) {
          console.log('[SYNC] Skipped: actionQueue is empty');
        }
        return;
      }

      console.log('[SYNC] Attempting to sync queued actions:', queuedActions.length);
      const synced = await syncQueuedActions(queuedActions);
      if (synced && !cancelled) {
        console.log('[SYNC] Success: queue cleared');
        clearQueuedActions();
      } else if (!cancelled) {
        console.log('[SYNC] Failed: will retry in 10s');
      }
    };

    attemptSync();
    const intervalId = window.setInterval(attemptSync, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
    }, [isOnline]);
  const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
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
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/overview"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_VIEW']}>
            <Overview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addproject"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_CREATE']}>
            <AddProject onAddProject={addProject} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_VIEW']}>
            <ProjectPage projects={projects} onDeleteProject={deleteProject} onUpdateProject={updateProject} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/site-analysis"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_VIEW']}>
            <SiteAnalysisPage projects={projects} updateProject={updateProject} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/research"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_VIEW']}>
            <ResearchPage projects={projects} updateProject={updateProject} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/design"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_VIEW']}>
            <DesignPage projects={projects} updateProject={updateProject} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_UPDATE']}>
            <EditPage projects={projects} onUpdateProject={updateProject} />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<RegisterPage onRegisterUser={registerUser} />} />
      <Route path="/login" element={<LoginPage onLoginUser={loginUser} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/project/:projectId/shadow-path"
        element={
          <ProtectedRoute requiredPermissions={['PROJECT_VIEW']}>
            <ShadowPath projects={projects} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/totp-setup"
        element={
          <ProtectedRoute>
            <TotpSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/webauthn-setup"
        element={
          <ProtectedRoute>
            <WebAuthnSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/observations"
        element={
          <ProtectedRoute requiredPermissions={['USER_MANAGE']}>
            <ObservationPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App