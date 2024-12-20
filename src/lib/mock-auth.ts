import { User, UserRole } from '@/types/auth';

const AUTH_KEY = 'auth_user';

let mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@6fitness.com',
    password: 'Admin123!',
    role: 'admin',
    name: '6.fitness Admin',
    isActive: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }
];

export async function signIn(email: string, password: string): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('No user found with this email');
  }
  
  if (user.password !== password) {
    throw new Error('Invalid password');
  }

  if (!user.isActive) {
    throw new Error('Account is inactive. Please contact your administrator.');
  }
  
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
}

export async function signUp(email: string, password: string, role: UserRole, name: string): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!email || !password || !role || !name) {
    throw new Error('All fields are required');
  }
  
  if (mockUsers.some(u => u.email === email)) {
    throw new Error('User already exists with this email');
  }
  
  const newUser: User = {
    id: String(mockUsers.length + 1),
    email,
    role,
    name,
    isActive: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  
  mockUsers.push({ ...newUser, password });
  return newUser;
}

export function signOut(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('storage')); // Trigger storage event for cross-tab sync
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}

// Add function to get all users (for admin only)
export async function getUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers.map(({ password: _, ...user }) => user);
}

// Add function to create user (for admin only)
export async function createUser(data: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (mockUsers.some(u => u.email === data.email)) {
    throw new Error('User already exists with this email');
  }

  const newUser: User = {
    id: String(mockUsers.length + 1),
    ...data,
    isActive: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  mockUsers.push({ ...newUser, password: data.password });
  return newUser;
}

// Add function to update user (for admin only)
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');

  mockUsers[index] = {
    ...mockUsers[index],
    ...data,
    updated: new Date().toISOString(),
  };

  return mockUsers[index];
}

// Add function to delete user (for admin only)
export async function deleteUser(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockUsers = mockUsers.filter(u => u.id !== id);
}