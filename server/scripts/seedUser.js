import bcrypt from 'bcryptjs';
import { getUsers, saveUsers, createUser } from '../database/users.js';

const seedTestUser = async () => {
  try {
    const users = getUsers();
    
    // Check if test user already exists
    const existingUser = users.find(u => u.email === 'test@hostpilot.com');
    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log('Email: test@hostpilot.com');
      console.log('Password: test123456');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123456', 10);
    
    const testUser = createUser({
      email: 'test@hostpilot.com',
      password: hashedPassword,
      name: 'Test User',
      companyName: 'HostPilot Test Company',
      role: 'host',
      createdAt: new Date().toISOString(),
    });

    users.push(testUser);
    saveUsers(users);

    console.log('✅ Test user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Email: test@hostpilot.com');
    console.log('Password: test123456');
    console.log('\nYou can now login at http://localhost:5173/login');
  } catch (error) {
    console.error('❌ Error seeding user:', error);
  }
};

seedTestUser();

