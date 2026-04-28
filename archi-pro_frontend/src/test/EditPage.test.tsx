import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditPage from '../pages/EditPage';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectPage from '../pages/ProjectPage';
const mockProject = {
    id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
    projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
    projectStartDate: '2024-01-15',
    projectDueDate: '2025-12-31',
    projectCreatedAt: '2024-01-10T10:00:00Z',
    projectUpdatedAt: '2024-06-01T15:30:00Z'
};

test('renders EditPage with project data', () => {
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter the project title')).toHaveValue(mockProject.projectName);
    expect(screen.getByPlaceholderText('Residential')).toHaveValue(mockProject.projectCategory);
    expect(screen.getByPlaceholderText('Write a short description')).toHaveValue(mockProject.projectDescription);
    const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
    expect(dateInputs[0]).toHaveValue(mockProject.projectStartDate);
    expect(dateInputs[1]).toHaveValue(mockProject.projectDueDate);
});

test('shows not found message when no project is found', () => {
    render(
        <MemoryRouter initialEntries={["/edit/999"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    expect(screen.getByText('Project not found. Please go back to the projects list and select a project to edit.')).toBeInTheDocument();
});

test('shows inline error when trying to update with empty fields', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const titleInput = screen.getByPlaceholderText('Enter the project title');
    await user.clear(titleInput);
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Project title is required.')).toBeInTheDocument();
});

test('shows inline error when start date is after due date', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
    const startDateInput = dateInputs[0];
    const dueDateInput = dateInputs[1];
    await user.clear(startDateInput);
    await user.clear(dueDateInput);
    await user.type(startDateInput, '2025-01-01');
    await user.type(dueDateInput, '2024-12-31');
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Due date must be after start date.')).toBeInTheDocument();
});

test('shows inline error when fields contain whitespace', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const titleInput = screen.getByPlaceholderText('Enter the project title');
    await user.clear(titleInput);
    await user.type(titleInput, '   ');
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Project title is required.')).toBeInTheDocument();
});

test('redirects to project page when cancel is clicked', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
                <Route path="/project/:id" element={<ProjectPage projects={[mockProject]} onDeleteProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(screen.getByText('Housing complex')).toBeInTheDocument();
});

test('shows inline error when category is empty', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const categoryInput = screen.getByPlaceholderText('Residential');
    await user.clear(categoryInput);
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Category is required.')).toBeInTheDocument();
});

test('shows inline error when start date is empty', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const startDateInput = screen.getAllByPlaceholderText('dd/mm/yyyy')[0];
    await user.clear(startDateInput);
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Start date is required.')).toBeInTheDocument();
});

test('shows inline error when due date is empty', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const dueDateInput = screen.getAllByPlaceholderText('dd/mm/yyyy')[1];
    await user.clear(dueDateInput);
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Due date is required.')).toBeInTheDocument();
});

test('shows inline error when description is empty', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/edit/1"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );
    const descriptionInput = screen.getByPlaceholderText('Write a short description');
    await user.clear(descriptionInput);
    const updateButton = screen.getByText('Edit project');
    await user.click(updateButton);
    expect(screen.getByText('Description is required.')).toBeInTheDocument();
});