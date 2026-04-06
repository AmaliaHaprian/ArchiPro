import type { Project } from '../models/Project';
import { useNavigate } from 'react-router-dom';
import './ProjectTopContainer.css';
import calendarIcon from '../assets/calendar.png';
function ProjectTopContainer({
    project,
    onDeleteProject
}: {
    project: Project;
    onDeleteProject: () => void;
}) {
    const navigate = useNavigate();

    const handleDelete =() => {
        onDeleteProject();
    }

    const handleEdit = () => {
        navigate(`/edit/${project.id}`);
    }

    return (
        <div className="project-top-container">
            <div className='project-header'>
                <h1>{project.projectName}</h1>
                <div className='project-actions'>
                    <button className='edit-button' onClick={handleEdit}>
                        Edit
                    </button>
                    <button className='delete-button' onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </div>

            <div className='project-details'>
                <div className='project-dates'>
                    <div className='start-date'>
                        <img src={calendarIcon} alt="Calendar" />
                        <h3>Start date: {project.projectStartDate}</h3>
                    </div>
                    
                    <div className='due-date'>
                        <img src={calendarIcon} alt="Calendar" />
                        <h3>End date: {project.projectDueDate}</h3>
                    </div>
                </div>

                <div className='progress-area'>
                    <span>Progress</span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${project.projectProgres}%` }}
                        />
                    </div>
                    <p>{project.projectProgres}%</p>
                </div>
            </div>
        </div>
    );
}

export default ProjectTopContainer;