import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';

jest.mock('../../api', () => ({
  registerUser: jest.fn()
}));

import { registerUser } from '../../api';

describe('RegisterForm', () => {
  beforeEach(() => {
    (registerUser as jest.Mock).mockReset();
    localStorage.clear();
  });

  it('calls registerUser and stores user in localStorage', async () => {
    const mockUser = { id: '42', username: 'u', email: 'u@example.com', role: 'USER', permissions: [] };
    (registerUser as jest.Mock).mockResolvedValue(mockUser);

    const onRegisterUser = jest.fn();
    render(
      <MemoryRouter>
        <RegisterForm onRegisterUser={onRegisterUser} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'u');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'u@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => expect(registerUser).toHaveBeenCalled());
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    expect(stored).toHaveProperty('id', '42');
    expect(stored).toHaveProperty('email', 'u@example.com');
  });
});
