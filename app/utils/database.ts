import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

const db = openDatabaseSync('forkast.db');

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  studentId?: string;
}

export interface FoodRating {
  id?: number;
  userId: number;
  tasteRating: number;
  portionRating: number;
  varietyRating: number;
  overallRating: number;
  comment?: string;
  createdAt: string;
}

export interface MenuItem {
  id?: number;
  name: string;
  weekStartDate: string;
  isActive: boolean;
}

export const resetDatabase = () => {
  try {
    db.execSync(`
      DROP TABLE IF EXISTS food_ratings;
      DROP TABLE IF EXISTS users;
    `);
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create tables if they don't exist
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          studentId TEXT
        );

        CREATE TABLE IF NOT EXISTS food_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          tasteRating INTEGER NOT NULL,
          portionRating INTEGER NOT NULL,
          varietyRating INTEGER NOT NULL,
          overallRating INTEGER NOT NULL,
          comment TEXT,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          weekStartDate TEXT NOT NULL,
          isActive BOOLEAN DEFAULT 1,
          createdAt TEXT NOT NULL
        );
      `);
      console.log('Database initialized successfully');
      resolve();
    } catch (error) {
      console.error('Error initializing database:', error);
      reject(error);
    }
  });
};

export const createUser = (user: User): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(
        `INSERT INTO users (name, email, password, role, studentId) 
         VALUES (?, ?, ?, ?, ?);`,
        [user.name, user.email, user.password, user.role, user.studentId || null]
      );
      resolve(result.lastInsertRowId);
    } catch (error) {
      reject(error);
    }
  });
};

export const getUserByEmail = (email: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    try {
      const user = db.getFirstSync<User>(
        'SELECT * FROM users WHERE email = ?;',
        [email]
      );
      resolve(user || null);
    } catch (error) {
      reject(error);
    }
  });
};

export const validateLogin = (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    try {
      const user = db.getFirstSync<User>(
        'SELECT * FROM users WHERE email = ? AND password = ?;',
        [email, password]
      );
      resolve(user || null);
    } catch (error) {
      reject(error);
    }
  });
};

export const addFoodRating = (rating: Omit<FoodRating, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(
        `INSERT INTO food_ratings (userId, tasteRating, portionRating, varietyRating, overallRating, comment, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [rating.userId, rating.tasteRating, rating.portionRating, rating.varietyRating, rating.overallRating, rating.comment || null, rating.createdAt]
      );
      resolve(result.lastInsertRowId);
    } catch (error) {
      reject(error);
    }
  });
};

export const getStudentRatingStreak = (userId: number): Promise<{
  currentStreak: number;
  lastRatingDate: string | null;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.getFirstSync<{ count: number; lastDate: string }>(
        `SELECT COUNT(*) as count, MAX(createdAt) as lastDate
         FROM food_ratings
         WHERE userId = ?;`,
        [userId]
      );

      resolve({
        currentStreak: result?.count || 0,
        lastRatingDate: result?.lastDate || null
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const hasRatedToday = (userId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count 
         FROM food_ratings 
         WHERE userId = ? 
         AND date(createdAt) = date('now');`,
        [userId]
      );
      resolve((result?.count ?? 0) > 0);
    } catch (error) {
      reject(error);
    }
  });
};

export const getWeeklyMealStats = (): Promise<{
  bestMeal: { name: string; rating: number };
  worstMeal: { name: string; rating: number };
}> => {
  return new Promise((resolve, reject) => {
    try {
      // Get the date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateString = sevenDaysAgo.toISOString().split('T')[0];

      // Get average ratings for each meal in the last 7 days
      const result = db.getAllSync<{ name: string; avgRating: number }>(
        `SELECT 
          CASE 
            WHEN tasteRating >= 4 THEN 'Chicken Pot Pie'
            WHEN tasteRating >= 3 THEN 'Burger'
            WHEN tasteRating >= 2 THEN 'Cheese Pizza'
            WHEN tasteRating >= 1 THEN 'Salad'
            ELSE 'Hot Dog'
          END as name,
          AVG((tasteRating + portionRating + varietyRating + overallRating) / 4.0) as avgRating
         FROM food_ratings
         WHERE createdAt >= ?
         GROUP BY name
         ORDER BY avgRating DESC;`,
        [dateString]
      );

      if (result && result.length > 0) {
        resolve({
          bestMeal: { name: result[0].name, rating: result[0].avgRating },
          worstMeal: { name: result[result.length - 1].name, rating: result[result.length - 1].avgRating }
        });
      } else {
        resolve({
          bestMeal: { name: 'No ratings yet', rating: 0 },
          worstMeal: { name: 'No ratings yet', rating: 0 }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const addNextWeekMenu = (menuItems: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Get next week's start date (next Monday)
      const today = new Date();
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));
      const weekStartDate = nextMonday.toISOString().split('T')[0];

      // Insert each menu item
      menuItems.forEach(item => {
        db.runSync(
          `INSERT INTO menu_items (name, weekStartDate, isActive, createdAt) 
           VALUES (?, ?, 1, datetime('now'));`,
          [item, weekStartDate]
        );
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const getCurrentMenu = (): Promise<MenuItem[]> => {
  return new Promise((resolve, reject) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const menuItems = db.getAllSync<MenuItem>(
        `SELECT * FROM menu_items 
         WHERE weekStartDate <= ? AND isActive = 1
         ORDER BY weekStartDate DESC, name ASC;`,
        [today]
      );
      resolve(menuItems);
    } catch (error) {
      reject(error);
    }
  });
}; 