import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket} from "socket.io-client";
import { API_BASE_URL } from "../api";
import { fetchProjects } from "../api";

const ProjectContext = createContext<any>(null);
const socket = io(`${API_BASE_URL}/`, {
    transports: ['websocket', 'polling'],
});

export const ProjectsProvider = ({ children }: { children: React.ReactNode }) => {
    const [projects, setProjects] = useState([]);
    useEffect(() => {
        try {
            socket.on('connect_error', (err) => {
                console.warn('Socket.IO connection error:', err);
            });
            socket.on('projectsAdded', async () =>{
                console.log('Received projectsAdded event from server');
                const updatedProjects = await fetchProjects(1);
                setProjects(updatedProjects);
            });
        } catch (err) {
            console.warn('Socket.IO failed to initialize:', err);
        }
        return () => {
            if (socket) {
                socket.off('projectsAdded');
                socket.off('connect_error');
                socket.disconnect();
            };
        }
    }, []);
    return (
        <ProjectContext.Provider value={{ projects, setProjects }}>
            {children}
        </ProjectContext.Provider>
    )
};

//export const useProjects = () => useContext(ProjectContext);