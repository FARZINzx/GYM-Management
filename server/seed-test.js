import bcrypt from 'bcrypt';
import {query} from './src/config/db.js';

const seedTestUsers = async () => {
  const testUsers = [
    {
      first_name: 'Gym',
      last_name: 'Admin',
      username: 'admin',
      password: 'AdminPass123!',
      role: 'admin',
      phone: '+1111111111',
      birth_date: '1985-01-01'
    },
    {
      first_name: 'John',
      last_name: 'Trainer',
      username: 'trainer1',
      password: 'TrainerPass123!',
      role: 'trainer',
      phone: '+1222222222',
      birth_date: '1990-05-15'
    }
  ];

  try {
    for (const user of testUsers) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(user.password, salt);
      
      await query(
        `INSERT INTO employee 
        (first_name, last_name, username, password_hash, role, phone, birth_date, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.first_name,
          user.last_name,
          user.username,
          password_hash,
          user.role,
          user.phone,
          new Date(user.birth_date),
          true
        ]
      );
      console.log(`User ${user.username} created`);
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit();
  }
};

seedTestUsers();