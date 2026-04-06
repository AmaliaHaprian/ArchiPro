import AddForm from '../components/AddForm';
import './AddProject.css';

function AddProject({ onAddProject }: { onAddProject: (project: any) => void }) {
    return (
        <div className='add-project-page'>
            <h1 className='page-title'>Create new project</h1>
            <AddForm onAddProject={onAddProject} />
        </div>
    );
}
export default AddProject;