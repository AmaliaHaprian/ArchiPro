import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../pages/Home';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home', () => {
    it('should render Hero and Features components', () => {
        renderWithRouter(<Home />);
        
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        expect(screen.getByText('Discover')).toBeInTheDocument();

        expect(screen.getByText('Track and mangage architecture projects easily')).toBeInTheDocument();
        expect(screen.getByAltText('Feature 1')).toBeInTheDocument();
        
        expect(screen.getByAltText('Feature 2')).toBeInTheDocument();
        expect(screen.getByText('Manage projects')).toBeInTheDocument();
        expect(screen.getByText('Project Stages')).toBeInTheDocument();
        expect(screen.getByText('Monitor progress')).toBeInTheDocument();
    })

});