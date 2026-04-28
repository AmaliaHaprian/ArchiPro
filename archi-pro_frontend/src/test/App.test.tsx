import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

// Wrapper component for Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockProjects = [{
    id: '1', projectName: 'Housing complex', projectStatus: 'In progress', projectCategory: 'Residential', projectProgres: 25,
    projectDescription: 'Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.',
    projectStartDate: '2024-01-15',
    projectDueDate: '2025-12-31'
  },
        {
          id: '2', projectName: 'Urban Park', projectStatus: 'Done', projectCategory: 'Landscape', projectProgres: 100,
          projectDescription: '',
          projectStartDate: '',
          projectDueDate: ''
        },
    ];

describe('App', () => {
    it('should render the home page', () => {
        renderWithRouter(<App />);
        expect(screen.getByText('Track and mangage architecture projects easily')).toBeInTheDocument();
        
    });
});
