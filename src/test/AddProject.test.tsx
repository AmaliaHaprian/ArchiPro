import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddProject from '../pages/AddProject';
import { BrowserRouter } from 'react-router-dom';

const mockOnAddProject = jest.fn();
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AddProject', () => {
    it('should render the add project page', () => {
        renderWithRouter(<AddProject onAddProject={mockOnAddProject}/>);
        expect(screen.getByText('Create new project')).toBeInTheDocument();
    });

    it('should redirect to overview page when clicking the Cancel button', async () => {
        const user = userEvent.setup();
        
        renderWithRouter(<AddProject onAddProject={mockOnAddProject}/>);

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toBeInTheDocument();
        await user.click(cancelButton);
        expect(window.location.pathname).toBe('/overview');
    });

    it('should redirect to overview page after adding a project', async () => {
        const user = userEvent.setup();
        renderWithRouter(<AddProject onAddProject={mockOnAddProject}/>);
        const titleInput = screen.getByPlaceholderText('Enter the project title');
        const categoryInput = screen.getByPlaceholderText('Residential');
        const descriptionInput = screen.getByPlaceholderText('Write a short description');
        const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
        const startDateInput = dateInputs[0];
        const dueDateInput = dateInputs[1];

        await user.type(titleInput, 'Test Project');
        await user.type(categoryInput, 'Residential');
        await user.type(descriptionInput, 'Test description for the project');
        await user.type(startDateInput, '2024-01-15');
        await user.type(dueDateInput, '2024-12-31');
        const addButton = screen.getByText('Add project');
        await user.click(addButton);
        expect(mockOnAddProject).toHaveBeenCalled();
        expect(window.location.pathname).toBe('/overview');
    });
});
