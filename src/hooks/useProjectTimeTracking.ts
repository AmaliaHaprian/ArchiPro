/**
 * Hook for automatic project time tracking
 * Tracks time spent whenever a project page is open
 */

import { useEffect } from 'react';
import { startTimeTracking, stopTimeTracking } from '../utils/timeTracking';

/**
 * Use this hook on any project-related page to automatically track time
 * @param projectId The ID of the project being viewed
 */
export function useProjectTimeTracking(projectId: string | undefined) {
  useEffect(() => {
    if (!projectId) return;
    
    // Start tracking when component mounts
    startTimeTracking(projectId);
    
    // Stop tracking when component unmounts or projectId changes
    return () => {
      stopTimeTracking(projectId);
    };
  }, [projectId]);
}
