/**
 * Time tracking utilities for project management
 * Stores time spent on projects in localStorage
 */

const TIME_TRACKING_KEY = 'projectTimeTracking';
const SESSION_START_KEY = 'sessionStartTime';

interface TimeTrackingData {
  [projectId: string]: number; // time in seconds
}

/**
 * Get total time spent on a project from localStorage
 */
export function getProjectTimeSpent(projectId: string): number {
  const data = localStorage.getItem(TIME_TRACKING_KEY);
  if (!data) return 0;
  
  const timeData: TimeTrackingData = JSON.parse(data);
  return timeData[projectId] || 0;
}

/**
 * Start tracking time for a project
 * Call this when user enters the project page
 */
export function startTimeTracking(projectId: string): void {
  // Store the session start time
  sessionStorage.setItem(`${SESSION_START_KEY}_${projectId}`, new Date().getTime().toString());
}

/**
 * Stop tracking and save time for a project
 * Call this when user leaves the project page
 */
export function stopTimeTracking(projectId: string): void {
  const sessionKey = `${SESSION_START_KEY}_${projectId}`;
  const startTime = sessionStorage.getItem(sessionKey);
  
  if (!startTime) return;
  
  const endTime = new Date().getTime();
  const timeSpentMs = endTime - parseInt(startTime, 10);
  const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
  
  if (timeSpentSeconds > 0) {
    addTimeToProject(projectId, timeSpentSeconds);
  }
  
  // Clean up session storage
  sessionStorage.removeItem(sessionKey);
}

/**
 * Add time to a project's total
 */
function addTimeToProject(projectId: string, seconds: number): void {
  const data = localStorage.getItem(TIME_TRACKING_KEY);
  const timeData: TimeTrackingData = data ? JSON.parse(data) : {};
  
  timeData[projectId] = (timeData[projectId] || 0) + seconds;
  localStorage.setItem(TIME_TRACKING_KEY, JSON.stringify(timeData));
}

/**
 * Format seconds into human-readable time
 * e.g., "2h 30m 45s" or "45m 30s"
 */
export function formatTimeSpent(seconds: number): string {
  if (seconds === 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Get all projects' time tracking data
 */
export function getAllTimeTrackingData(): TimeTrackingData {
  const data = localStorage.getItem(TIME_TRACKING_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * Reset time for a specific project
 */
export function resetProjectTime(projectId: string): void {
  const data = localStorage.getItem(TIME_TRACKING_KEY);
  if (!data) return;
  
  const timeData: TimeTrackingData = JSON.parse(data);
  delete timeData[projectId];
  localStorage.setItem(TIME_TRACKING_KEY, JSON.stringify(timeData));
}

/**
 * Reset all time tracking data
 */
export function resetAllTimeTracking(): void {
  localStorage.removeItem(TIME_TRACKING_KEY);
}
