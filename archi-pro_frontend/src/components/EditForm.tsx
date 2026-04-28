// Helper to format ISO or Date string to yyyy-MM-dd
function toDateInputValue(dateString: string): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}
import { useEffect, useState } from 'react';
import './EditForm.css';
import { useNavigate } from 'react-router-dom';
import type { Project, ProjectCategory } from '../models/Project';
import { ProjectCategory as ProjectCategoryValues } from '../models/Project';
import { updateProject } from '../api';
import { fetchProjectById } from '../api';
import { queueAction, useNetworkStatus } from '../hooks/useNetworkStatus';
import type { Action } from '../models/Action';

function EditForm({ project ,  onUpdateProject }: { project: Project;  onUpdateProject: (updatedProject: Project) => void }) {
    const navigate = useNavigate();
        
    const [projectTitle, setProjectTitle] = useState(project.title || '');
    const [projectCategory, setProjectCategory] = useState<ProjectCategory>(project.category);
    const [startDate, setStartDate] = useState(project.startDate || '');
    const [dueDate, setDueDate] = useState(project.endDate || '');
    const [description, setDescription] = useState(project.description || '');

     const [errors, setErrors] = useState({
        projectTitle: '',
        projectCategory: '',
        startDate: '',
        dueDate: '',
        description: ''
    });
    
    const validateForm = () => {
        let valid = true;
        const newErrors = {
            projectTitle: '',
            projectCategory: '',
            startDate: '',
            dueDate: '',
            description: ''
        };
        if (!projectTitle.trim()) {
            newErrors.projectTitle = 'Project title is required.';
            valid = false;
        }
        if (!projectCategory.trim()) {
            newErrors.projectCategory = 'Category is required.';
            valid = false;
        }
        if (!startDate) {
            newErrors.startDate = 'Start date is required.';
            valid = false;
        }
        if (!dueDate) {
            newErrors.dueDate = 'Due date is required.';
            valid = false;
        }
        if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
            newErrors.dueDate = 'Due date must be after start date.';
            valid = false;
        }
        if (!description.trim()) {
            newErrors.description = 'Description is required.';
            valid = false;
        }
        
        setErrors(newErrors);
        return valid;
    };

    const handleEditProject = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const updatedProject = {
            category: projectCategory,
            endDate: dueDate,
            description: description,

        };

        // if(!isOnline) {
        //     const newAction : Action = {
        //         type: 'update',
        //         data: { id: project.id, project: updatedProject }
        //     }
        //     queueAction(newAction);
        //     navigate('/project/' + project.id, { state: { project: updatedProject } });
        //     return;
        // }
        updateProject(project.id, updatedProject)
        navigate('/project/' + project.id, { state: { project: updatedProject } });
    }

    const handleCancel = () => {
        navigate('/project/' + project.id, { state: { project: project } });
    }

    return (
        <div className='add-container'>
            <form className="add-form">
                <label>Project title*</label>
                <input type="text" placeholder="Enter the project title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} disabled/>
                {errors.projectTitle && <span className="error-message">{errors.projectTitle}</span>}

                <label>Category*</label>
                <select value={projectCategory} onChange={e => setProjectCategory(e.target.value as ProjectCategory)}>
                    <option value={ProjectCategoryValues.RESIDENTIAL}>Residential</option>
                    <option value={ProjectCategoryValues.LANDSCAPE}>Landscape</option>
                    <option value={ProjectCategoryValues.URBAN}>Urban</option>
                    <option value={ProjectCategoryValues.MIXED_USE}>Mixed use</option>
                    <option value={ProjectCategoryValues.CULTURAL}>Cultural</option>
                    <option value={ProjectCategoryValues.INFRASTRUCTURE}>Infrastructure</option>
                </select>
                {errors.projectCategory && <span className="error-message">{errors.projectCategory}</span>}

                <label>Start date*</label>
                <input type="date" placeholder="dd/mm/yyyy" value={toDateInputValue(startDate)} onChange={(e) => setStartDate(e.target.value)} disabled/>
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}

                <label>Due date*</label>
                <input type="date" placeholder="dd/mm/yyyy" value={toDateInputValue(dueDate)} onChange={(e) => setDueDate(e.target.value)} />
                {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
                <label>Description*</label>
                <input type="text" placeholder="Write a short description" value={description} onChange={(e) => setDescription(e.target.value)} />
                {errors.description && <span className="error-message">{errors.description}</span>}
            </form>

            <div className="edit-form-buttons">
                <button type="button" className="edit-project-button" onClick={handleEditProject}>Edit project</button>
                <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default EditForm;