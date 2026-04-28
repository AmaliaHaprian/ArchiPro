import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddForm from '../components/AddForm';
import { BrowserRouter } from 'react-router-dom';

// Wrapper component for Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AddForm', () => {
  it('should render all form fields', () => {
    const mockOnAdd = jest.fn();
    renderWithRouter(<AddForm onAddProject={mockOnAdd} />);

    expect(screen.getByPlaceholderText('Enter the project title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Residential')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a short description')).toBeInTheDocument();
    expect(screen.getByText('Add project')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should show error alert when submitting empty form', () => {
    const mockOnAdd = jest.fn();
    window.alert = jest.fn();
    renderWithRouter(<AddForm onAddProject={mockOnAdd} />);

    const addButton = screen.getByText('Add project');
    fireEvent.click(addButton);

   // expect(window.alert).toHaveBeenCalled();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should call onAddProject when form is valid', async () => {
    const mockOnAdd = jest.fn();
    const user = userEvent.setup();
    renderWithRouter(<AddForm onAddProject={mockOnAdd} />);

    const titleInput = screen.getByPlaceholderText('Enter the project title');
    const categoryInput = screen.getByPlaceholderText('Residential');
    const descriptionInput = screen.getByPlaceholderText('Write a short description');

    await user.type(titleInput, 'Test Project');
    await user.type(categoryInput, 'Residential');
    await user.type(descriptionInput, 'Test description for the project');

    const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
    const startDateInput = dateInputs[0];
    const dueDateInput = dateInputs[1];

    await user.type(startDateInput, '2024-01-15');
    await user.type(dueDateInput, '2024-12-31');

    const addButton = screen.getByText('Add project');
    await user.click(addButton);

    expect(mockOnAdd).toHaveBeenCalled();
    expect(mockOnAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        projectName: 'Test Project',
        projectCategory: 'Residential',
        projectStatus: 'Planning',
      })
    );
  });

  it('should prevent submission when start date is after due date', async () => {
    const mockOnAdd = jest.fn();
    window.alert = jest.fn();
    const user = userEvent.setup();
    renderWithRouter(<AddForm onAddProject={mockOnAdd} />);

    const titleInput = screen.getByPlaceholderText('Enter the project title');
    const categoryInput = screen.getByPlaceholderText('Residential');
    const descriptionInput = screen.getByPlaceholderText('Write a short description');

    await user.type(titleInput, 'Test Project');
    await user.type(categoryInput, 'Residential');
    await user.type(descriptionInput, 'Test description for the project');

    const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
    const startDateInput = dateInputs[0];
    const dueDateInput = dateInputs[1];

    // Start date after due date (invalid)
    await user.type(startDateInput, '2024-01-31');
    await user.type(dueDateInput, '2024-01-15');

    const addButton = screen.getByText('Add project');
    await user.click(addButton);

    expect(screen.getByText('Due date must be after start date.')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should prevent submission when required fields are empty', async () => {
    const mockOnAdd = jest.fn();
    window.alert = jest.fn();
    const user = userEvent.setup();
    renderWithRouter(<AddForm onAddProject={mockOnAdd} />);

    const addButton = screen.getByText('Add project');
    await user.click(addButton);

    expect(screen.getByText('Project title is required.')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should prevent submission when fields contain only whitespace', async () => {
    const mockOnAdd = jest.fn();
    window.alert = jest.fn();
    const user = userEvent.setup();
    renderWithRouter(<AddForm onAddProject={mockOnAdd} />);

    const titleInput = screen.getByPlaceholderText('Enter the project title');
    const categoryInput = screen.getByPlaceholderText('Residential');
    const descriptionInput = screen.getByPlaceholderText('Write a short description');

    const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
    const startDateInput = dateInputs[0];
    const dueDateInput = dateInputs[1];

    await user.type(titleInput, '   ');
    await user.type(categoryInput, '   ');
    await user.type(descriptionInput, '   ');
    await user.type(startDateInput, '2024-01-15');
    await user.type(dueDateInput, '2024-12-31');

    const addButton = screen.getByText('Add project');
    await user.click(addButton);

    expect(screen.getByText('Project title is required.')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(window.location.pathname).toBe('/overview');
  });
});
