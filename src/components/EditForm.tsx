import { useState } from 'react';
import './EditForm.css';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../models/Project';

function EditForm({ project, onUpdateProject }: { project: Project; onUpdateProject: (updatedProject: Project) => void }) {
    const navigate = useNavigate();

    const [projectTitle, setProjectTitle] = useState(project.projectName);
    const [projectCategory, setProjectCategory] = useState(project.projectCategory);
    const [startDate, setStartDate] = useState(project.projectStartDate);
    const [dueDate, setDueDate] = useState(project.projectDueDate);
    const [description, setDescription] = useState(project.projectDescription);

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
            id: project.id,
            projectName: projectTitle,
            projectCategory: projectCategory,
            projectStartDate: startDate,
            projectDueDate: dueDate,
            projectDescription: description,
            projectStatus: project.projectStatus,
            projectProgres: project.projectProgres,
            projectCreatedAt: project.projectCreatedAt,
            projectUpdatedAt: new Date().toISOString()
        };
        onUpdateProject(updatedProject);
        navigate('/project/' + project.id, { state: { project: updatedProject } });
    }

    const handleCancel = () => {
        navigate('/project/' + project.id, { state: { project: project } });
    }

    return (
        <div className='add-container'>
            <form className="add-form">
                <label>Project title*</label>
                <input type="text" placeholder="Enter the project title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
                {errors.projectTitle && <span className="error-message">{errors.projectTitle}</span>}

                <label>Category*</label>
                <input type="text" placeholder="Residential" value={projectCategory} onChange={(e) => setProjectCategory(e.target.value)} />
                {errors.projectCategory && <span className="error-message">{errors.projectCategory}</span>}

                <label>Start date*</label>
                <input type="date" placeholder="dd/mm/yyyy" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}

                <label>Due date*</label>
                <input type="date" placeholder="dd/mm/yyyy" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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