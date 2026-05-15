import type { Action } from "./models/Action";
import type { Project } from "./models/Project";
import type { CreateUserDto, User } from "./models/User";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

export const API_BASE_URL = (configuredApiBaseUrl && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl
    : fallbackApiBaseUrl
).replace(/\/+$/, '');

function buildUserHeaders(headers: HeadersInit = {}): HeadersInit {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        return headers;
    }

    try {
        const user = JSON.parse(storedUser) as { userId?: string; id?: string };
        const userId = user.userId ?? user.id;
        if (!userId) {
            return headers;
        }

        return {
            ...headers,
            'x-user-id': userId,
        };
    } catch {
        return headers;
    }
}

export async function fetchProjects(page: number) : Promise<any> {
    const response = await fetch(`${API_BASE_URL}/projects?page=${page}`, {
        method: 'GET',
        headers: buildUserHeaders(),
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
            ...buildUserHeaders(),
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
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
}

export async function fetchProjectById(projectId: string) : Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
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
            ...buildUserHeaders(),
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
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStageBottleneck() : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/stage-bottleneck`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStatusDistribution() : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/status-distribution`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getTopCompleted() : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/statistics/top-completed-projects`, {
        method: 'GET',
        headers: buildUserHeaders(),
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
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}


export async function filterAndSearchProjects(title?: string, category?: string, status?: string) : Promise<Project[]> {
    // const params = new URLSearchParams();
    // if (status) params.append('status', status);
    // if (category) params.append('category', category);
    const response = await fetch(`${API_BASE_URL}/projects/filter?title=${encodeURIComponent(title || '')}&category=${encodeURIComponent(category || '')}&status=${encodeURIComponent(status || '')}`, {
        method: 'GET',
        headers: buildUserHeaders(),
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
            ...buildUserHeaders(),
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
        headers: buildUserHeaders(),
        
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
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function registerUser(user: CreateUserDto) {
    const response = await fetch(`${API_BASE_URL}/user/auth/register`, {
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

export async function loginUser(username: string, password: string) : Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
    }); 
    const rawBody = await response.text();

    if (!response.ok) {
        let message = 'Network response was not ok';
        if (rawBody.trim().length > 0) {
            try {
                const errorPayload = JSON.parse(rawBody);
                message = errorPayload?.message || message;
            } catch {
                message = rawBody;
            }
        }
        throw new Error(message);
    }

    if (rawBody.trim().length === 0) {
        throw new Error('Empty response from login endpoint');
    }

    return JSON.parse(rawBody) as User;
}

export async function getUserById(userId: string) : Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function fetchSuspiciousObservations() {
    const response = await fetch(`${API_BASE_URL}/logging/observations`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function resolveSuspiciousObservation(id: string) {
    const response = await fetch(`${API_BASE_URL}/logging/observations/${id}/resolve`, {
        method: 'PATCH',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function fetchChatMessages() {
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getProjectsByUserId(userId: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/projects`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getPaginatedFilteredProjectsByUserId(userId: string, page: number, title?: string, category?: string, status?: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/projects/filter?title=${encodeURIComponent(title || '')}&category=${encodeURIComponent(category || '')}&status=${encodeURIComponent(status || '')}&page=${page}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getProjectsByCategoryByUserId(userId: string) : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/projects-by-category/${userId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStageBottleneckByUserId(userId: string) : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/stage-bottleneck/${userId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getStatusDistributionByUserId(userId: string) : Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/statistics/status-distribution/${userId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    }); 
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getTopCompletedByUserId(userId: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/statistics/top-completed-projects/${userId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function getOverallStatisticsByUserId(userId: string) {
    const response = await fetch(`${API_BASE_URL}/statistics/overall-statistics/${userId}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

export async function filterAndSearchProjectsByUserId(userId: string, page: number, title?: string, category?: string, status?: string) : Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects/user/${userId}/filter?title=${encodeURIComponent(title || '')}&category=${encodeURIComponent(category || '')}&status=${encodeURIComponent(status || '')}&page=${page}`, {
        method: 'GET',
        headers: buildUserHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
