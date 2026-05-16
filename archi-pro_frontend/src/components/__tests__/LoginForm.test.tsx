import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { AuthContext } from '../AuthContext';

jest.mock('../../api', () => ({
  loginUser: jest.fn(),
}));

import { loginUser } from '../../api';

describe('LoginForm', () => {
  beforeEach(() => {
    (loginUser as jest.Mock).mockReset();
  });

  it('calls loginUser and auth.login on submit', async () => {
    const mockPayload = { access_token: 'abc123', user: { id: '1', email: 'a@b.com', role: 'USER', permissions: [] } };
    (loginUser as jest.Mock).mockResolvedValue(mockPayload);

    const auth = { login: jest.fn(), logout: jest.fn(), user: null } as any;
    const onLoginUser = jest.fn();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <LoginForm onLoginUser={onLoginUser} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith('a@b.com', 'password'));
    await waitFor(() => expect(auth.login).toHaveBeenCalledWith(mockPayload.access_token, mockPayload.user));
    expect(onLoginUser).toHaveBeenCalledWith('a@b.com', 'password');
  });
});
