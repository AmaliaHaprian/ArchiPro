import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectPage from '../pages/ProjectPage';
import { BrowserRouter } from 'react-router-dom';
import EditPage from '../pages/EditPage';
import Overview from '../pages/Overview';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockProject = {
    id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
    projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
    projectStartDate: '2024-01-15',
    projectDueDate: '2025-12-31',
    projectCreatedAt: '2024-01-10T10:00:00Z',
    projectUpdatedAt: '2024-06-01T15:30:00Z'
};

const mockDeleteProject = jest.fn();
const mockUpdateProject = jest.fn();
test('renders ProjectPage with project data', () => {
    render(
        <MemoryRouter initialEntries={["/project/1"]}>
            <Routes>
                 <Route path="/project/:id" element={<ProjectPage projects={[mockProject]} onDeleteProject={mockDeleteProject} />} />
            </Routes>
        </MemoryRouter>
    );
    expect(screen.getByText('Housing complex')).toBeInTheDocument();
});

test('renders not found message when project does not exist', () => {
    render(
        <MemoryRouter initialEntries={["/project/999"]}>
            <Routes>
                <Route path="/project/:id" element={<ProjectPage projects={[]} onDeleteProject={mockDeleteProject} />} />
            </Routes>
        </MemoryRouter>
    );
    expect(screen.getByText('Project not found. Open it from the projects list.')).toBeInTheDocument();
});

test('calls onDeleteProject when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/project/1"]}>
            <Routes>
                <Route path="/project/:id" element={<ProjectPage projects={[mockProject]} onDeleteProject={mockDeleteProject} />} />
                <Route path="/overview" element={<Overview projects={[mockProject]} />} />
            </Routes>
        </MemoryRouter>
    );
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    expect(mockDeleteProject).toHaveBeenCalledWith('1');
});


test('calls onUpdateProject when Update button is clicked', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/project/1"]}>
            <Routes>
                <Route path="/project/:id" element={<ProjectPage projects={[mockProject]} onDeleteProject={mockDeleteProject} />} />
                <Route path="/edit/:id" element={<EditPage projects={[mockProject]} onUpdateProject={mockUpdateProject} />} />
            </Routes>
        </MemoryRouter>
    );
    // Click Edit to go to EditPage
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    // Fill all required fields
    const titleInput = screen.getByPlaceholderText('Enter the project title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Housing complex');

    const categoryInput = screen.getByPlaceholderText('Residential');
    await user.clear(categoryInput);
    await user.type(categoryInput, 'Commercial');

    const dateInputs = screen.getAllByPlaceholderText('dd/mm/yyyy');
    const startDateInput = dateInputs[0];
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-02-01');

    const dueDateInput = dateInputs[1];
    await user.clear(dueDateInput);
    await user.type(dueDateInput, '2025-12-31');

    const descriptionInput = screen.getByPlaceholderText('Write a short description');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated description for the project');

    // Submit the form
    const updateProjectButton = screen.getByText('Edit project');
    await user.click(updateProjectButton);

        const updatedProject = {
                ...mockProject,
                projectName: 'Updated Housing complex',
                projectCategory: 'Commercial',
                projectStartDate: '2024-02-01',
                projectDueDate: '2025-12-31',
                projectDescription: 'Updated description for the project',
        };

        expect(mockUpdateProject).toHaveBeenCalledWith(
            expect.objectContaining({
                ...updatedProject,
                projectUpdatedAt: expect.any(String)
            })
        );
});


test('toggles sidebar visibility', async () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/project/1"]}>
            <Routes>
                <Route path="/project/:id" element={<ProjectPage projects={[mockProject]} onDeleteProject={mockDeleteProject} />} />
            </Routes>
        </MemoryRouter>
    );

    // The toggle button is the image with alt text 'Toggle Sidebar'
    const toggleButton = screen.getByAltText('Toggle Sidebar');
    // The sidebar is the aside element with class 'sidebar' or 'hidden-sidebar'
    let sidebar = document.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
    // Initially, the sidebar should be visible (class 'sidebar')
    expect(sidebar).toHaveClass('sidebar');
    // Click the toggle button to hide the sidebar
    await user.click(toggleButton);
    sidebar = document.querySelector('aside');
    expect(sidebar).toHaveClass('hidden-sidebar');
    // Click the toggle button again to show the sidebar
    await user.click(toggleButton);
    sidebar = document.querySelector('aside');
    expect(sidebar).toHaveClass('sidebar');
});