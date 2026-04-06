import { getCookieValue } from '../utils/cookies';
// Mock useNavigate at the very top
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overview from '../pages/Overview';
import { useNavigate } from 'react-router-dom';
import { within } from '@testing-library/react';

const renderWithRouter = (component: React.ReactElement) => {
  return render(component); // No need for BrowserRouter, since navigation is mocked
};

describe('Overview', () => {
    it('should render the overview page with projects', () => {
        const mockProjects = [{
            id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
            projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
            projectStartDate: '2024-01-15',
            projectDueDate: '2025-12-31',
            projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // add this
        },];

        renderWithRouter(<Overview projects={mockProjects} />);

        expect(screen.getByText('Projects')).toBeInTheDocument();

        const row=screen.getByText('Housing complex').closest('.project-row');
        expect(row).not.toBeNull();
        expect(within(row as HTMLElement).getByText('Housing complex')).toBeInTheDocument();
        expect(within(row as HTMLElement).getByText('In progress')).toBeInTheDocument();
        expect(within(row as HTMLElement).getByText('Residential')).toBeInTheDocument();
        expect(within(row as HTMLElement).getByText('25%')).toBeInTheDocument();
    });

    it('getCookieValue decodes URI components', () => {
      // Set a cookie with an encoded value
      document.cookie = 'theme=' + encodeURIComponent('light');
      const value = getCookieValue('theme', 'default');
      expect(value).toBe('light');
    });

    it('decodeURIComponent decodes encoded strings', () => {
      const encoded = encodeURIComponent('hello world!');
      expect(decodeURIComponent(encoded)).toBe('hello world!');
    });

    it('should update theme cookie when theme is changed', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Overview projects={[]} />);
      const themeToggle = screen.getByText('Toggle Theme');
      await user.click(themeToggle);
      expect(document.cookie).toContain('theme=dark');
      await user.click(themeToggle);
      expect(document.cookie).toContain('theme=light');
    });

    it('should redirect to add project page when clicking the New project button', async () => {
        const user = userEvent.setup();
        const mockNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        renderWithRouter(<Overview projects={[]} />);

        const newProjectButton = screen.getByText('+ New Project');
        expect(newProjectButton).toBeInTheDocument();
        await user.click(newProjectButton);
        expect(mockNavigate).toHaveBeenCalledWith('/addproject');
    });

    it('should paginate projects', async () => {
        const user=userEvent.setup();

        const mockProjects = [{
        id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
        projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
        projectStartDate: '2024-01-15',
        projectDueDate: '2025-12-31',
        projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        },
        {
          id: '2', projectName: 'Urban Park', projectStatus: 'Done', projectCategory: 'Landscape', projectProgres: 100,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        },
        {
          id: '3', projectName: 'Modern Art Gallery', projectStatus: 'Planning', projectCategory: 'Urban', projectProgres: 0,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        },
        {
          id: '4', projectName: 'Creative Hub', projectStatus: 'In progress', projectCategory: 'Mixed-use', projectProgres: 45,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        },
    {
          id: '5', projectName: 'Riverfront Homes', projectStatus: 'Planning', projectCategory: 'Residential', projectProgres: 10,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        },
        {
          id: '6', projectName: 'Science Museum', projectStatus: 'Done', projectCategory: 'Cultural', projectProgres: 100,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: '',
          projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        },];

        renderWithRouter(<Overview projects={mockProjects} />);

        expect(screen.getByText('Housing complex')).toBeInTheDocument();
        expect(screen.getByText('Urban Park')).toBeInTheDocument();
        expect(screen.getByText('Modern Art Gallery')).toBeInTheDocument();
        expect(screen.queryByText('Creative Hub')).not.toBeInTheDocument();

        const nextButton = screen.getByText('Next >');
        await user.click(nextButton);

        expect(screen.getByText('Creative Hub')).toBeInTheDocument();
        expect(screen.getByText('Riverfront Homes')).toBeInTheDocument();
        expect(screen.getByText('Science Museum')).toBeInTheDocument();

        const prevButton = screen.getByText('< Previous');
        await user.click(prevButton);

        expect(screen.getByText('Housing complex')).toBeInTheDocument();
        expect(screen.getByText('Urban Park')).toBeInTheDocument();
        expect(screen.getByText('Modern Art Gallery')).toBeInTheDocument();
        expect(screen.queryByText('Creative Hub')).not.toBeInTheDocument();


        const secondPageButton = screen.getByText('2');
        await user.click(secondPageButton);

        expect(screen.getByText('Creative Hub')).toBeInTheDocument();
        expect(screen.getByText('Riverfront Homes')).toBeInTheDocument();
        expect(screen.getByText('Science Museum')).toBeInTheDocument();
    });

    it('should call navigate with the correct project when clicking the folder action button', async () => {
        const user = userEvent.setup();
        const mockNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        const mockProjects = [{
            id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
            projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
            projectStartDate: '2024-01-15',
            projectDueDate: '2025-12-31',
            projectCreatedAt: '2024-01-01T00:00:00Z', // add this
            projectUpdatedAt: '2024-01-01T00:00:00Z', // 
        }];
        renderWithRouter(<Overview projects={mockProjects} />);
        await user.click(screen.getByLabelText('Open Housing complex'));
        expect(mockNavigate).toHaveBeenCalledWith('/project/1', {
          state: { project: expect.objectContaining({ id: '1' }) }
        });
    });
});