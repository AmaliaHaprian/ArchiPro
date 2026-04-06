import './AddForm.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function AddForm({ onAddProject }: { onAddProject: (project: any) => void }) {
    const navigate = useNavigate();

    const [projectTitle, setProjectTitle] = useState('');
    const [projectCategory, setProjectCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');

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

    const handleAddProject = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const project = {
            id: Date.now().toString(),
            projectName: projectTitle,
            projectCategory: projectCategory,
            projectStartDate: startDate,
            projectDueDate: dueDate,
            projectDescription: description,
            projectStatus: 'Planning',
            projectProgress: 0,
            projectCreatedAt: new Date().toISOString(),
            projectUpdatedAt: new Date().toISOString(),
            projectWorkingHours: 0,
            projectCurrentStage: 'Project Brief',
        };
        onAddProject(project);
        navigate('/overview');
    };

    const handleCancel = () => {
        navigate('/overview');
    }
    
    return (
        <div className='add-container'>
            <form className="add-form" onSubmit={handleAddProject} noValidate>
                <label>Project title*</label>
                <input
                    type="text"
                    placeholder="Enter the project title"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                />
                {errors.projectTitle && <span className="error-message">{errors.projectTitle}</span>}

                <label>Category*</label>
                <input
                    type="text"
                    placeholder="Residential"
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                />
                {errors.projectCategory && <span className="error-message">{errors.projectCategory}</span>}

                <label>Start date*</label>
                <input
                    type="date"
                    placeholder="dd/mm/yyyy"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}

                <label>Due date*</label>
                <input
                    type="date"
                    placeholder="dd/mm/yyyy"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
                {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}

                <label>Description*</label>
                <input
                    type="text"
                    placeholder="Write a short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
            </form>

            <div className="add-form-buttons">
                <button className="add-project-button" onClick={handleAddProject} type="submit">
                    Add project
                </button>
                <button className="cancel-button" onClick={handleCancel} type="button">
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default AddForm;