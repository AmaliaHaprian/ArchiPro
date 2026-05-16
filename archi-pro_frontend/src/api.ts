import type { Action } from "./models/Action";
import type { Project } from "./models/Project";
import type { AuthPayload, CreateUserDto, User } from "./models/User";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

export const API_BASE_URL = (configuredApiBaseUrl && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl
    : fallbackApiBaseUrl
).replace(/\/+$/, '');

function getAuthToken(): string | null {
    return localStorage.getItem('authToken') ?? localStorage.getItem('token');
}

export async function fetchProjects(page: number) : Promise<any> {
    const response = await fetch(`${API_BASE_URL}/projects?page=${page}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function saveProject(project: any) : Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(project),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function deleteProject(projectId: string) : Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
}

export async function fetchProjectById(projectId: string) : Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function updateProject(projectId: string, updatedData: any) : Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getProjectsByCategory() : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/projects-by-category`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStageBottleneck() : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/stage-bottleneck`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStatusDistribution() : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/status-distribution`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getTopCompleted() : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/statistics/top-completed-projects`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getOverallStatistics() {
    console.log("Top row statistics called");
    const response = await fetch(`${API_BASE_URL}/statistics/overall-statistics`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}


export async function filterAndSearchProjects(title?: string, category?: string, status?: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects/filter?title=${encodeURIComponent(title || '')}&category=${encodeURIComponent(category || '')}&status=${encodeURIComponent(status || '')}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function syncQueuedActions(actionQueue: Action[]) {
    const response= await fetch(`${API_BASE_URL}/projects/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(actionQueue ),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}


export async function startFakeDataGeneration(userId: string) {
    console.log('Starting fake data generation...');
    const response = await fetch(`${API_BASE_URL}/projects/start-fake-data?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
        
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function stopFakeDataGeneration() {
    console.log('Stopping fake data generation...');
    const response = await fetch(`${API_BASE_URL}/projects/stop-fake-data`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function registerUser(user: CreateUserDto) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function loginUser(username: string, password: string) : Promise<AuthPayload | { mfa_required: true; mfa_token: string; mfa_type: 'totp' }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
    });

    const data = await response.json() as any;

    // Handle MFA required response
    if (data.mfa_required && data.mfa_token) {
        return {
            mfa_required: true,
            mfa_token: data.mfa_token,
            mfa_type: data.mfa_type,
        };
    }

    // Handle successful login
    const { access_token, user } = data as { access_token: string; user: User };
    if (access_token && user) {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('authUser', JSON.stringify(user));
    }
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return { access_token, user };
}

export async function getUserById(userId: string) : Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function fetchSuspiciousObservations() {
    const response = await fetch(`${API_BASE_URL}/logging/observations`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function resolveSuspiciousObservation(id: string) {
    const response = await fetch(`${API_BASE_URL}/logging/observations/${id}/resolve`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function fetchChatMessages() {
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getProjectsByUserId(userId: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/projects`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getPaginatedFilteredProjectsByUserId(userId: string, page: number, title?: string, category?: string, status?: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/projects/filter?title=${encodeURIComponent(title || '')}&category=${encodeURIComponent(category || '')}&status=${encodeURIComponent(status || '')}&page=${page}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getProjectsByCategoryByUserId(userId: string) : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/projects-by-category/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStageBottleneckByUserId(userId: string) : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/stage-bottleneck/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStatusDistributionByUserId(userId: string) : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/status-distribution/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getTopCompletedByUserId(userId: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/statistics/top-completed-projects/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// ===================== TOTP Functions =====================

export async function generateTotpSecret(): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const response = await fetch(`${API_BASE_URL}/auth/totp/setup`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to generate TOTP secret');
    }
    return await response.json();
}

export async function verifyTotpSetup(totpCode: string, backupCodes: string[]): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/totp/verify-setup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ totpCode, backupCodes }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify TOTP setup');
    }
    return await response.json();
}

export async function verifyTotpLogin(mfaToken: string, totpCode: string): Promise<{ access_token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/totp/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mfaToken}`,
        },
        body: JSON.stringify({ totpCode }),
    });
    if (!response.ok) {
        throw new Error('Invalid TOTP code');
    }
    const data = await response.json();
    const { access_token, user } = data as { access_token: string; user: User };
    if (access_token && user) {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('authUser', JSON.stringify(user));
    }
    return { access_token, user };
}

export async function verifyBackupCodeLogin(mfaToken: string, backupCode: string): Promise<{ access_token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/totp/verify-backup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mfaToken}`,
        },
        body: JSON.stringify({ backupCode }),
    });
    if (!response.ok) {
        throw new Error('Invalid backup code');
    }
    const data = await response.json();
    const { access_token, user } = data as { access_token: string; user: User };
    if (access_token && user) {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('authUser', JSON.stringify(user));
    }
    return { access_token, user };
}

export async function getOverallStatisticsByUserId(userId: string) {
    const response = await fetch(`${API_BASE_URL}/statistics/overall-statistics/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function filterAndSearchProjectsByUserId(userId: string, page: number, title?: string, category?: string, status?: string) : Promise<Project[]> {
    console.log('token:', localStorage.getItem('token') ?? localStorage.getItem('authToken'));
    const response = await fetch(`${API_BASE_URL}/projects/user/${userId}/filter?title=${encodeURIComponent(title || '')}&category=${encodeURIComponent(category || '')}&status=${encodeURIComponent(status || '')}&page=${page}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
