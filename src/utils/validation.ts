import { AppError } from './errorHandler';

// Types for validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface PetStateData {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  coins: number;
  lastUpdateTime: number;
}

export interface UserData {
  email: string;
  username: string;
  password?: string;
}

// Validation constants
const PET_STATS_RANGE = { min: 0, max: 100 };
const USERNAME_LENGTH = { min: 3, max: 20 };
const PASSWORD_LENGTH = { min: 6, max: 100 };
const COINS_RANGE = { min: 0, max: 999999 };

// Sanitization functions
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[&"']/g, (match) => {
      switch (match) {
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return match;
      }
    });
};

export const sanitizeNumber = (input: any): number => {
  const num = Number(input);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100; // Round to 2 decimal places
};

// Pet state validation
export const validatePetState = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitized: PetStateData = {
    happiness: 75,
    hunger: 25,
    cleanliness: 85,
    energy: 80,
    coins: 10,
    lastUpdateTime: Date.now(),
  };

  // Validate happiness
  if (typeof data.happiness === 'number') {
    sanitized.happiness = Math.max(PET_STATS_RANGE.min, Math.min(PET_STATS_RANGE.max, data.happiness));
    if (data.happiness !== sanitized.happiness) {
      errors.push(`Happiness corrected from ${data.happiness} to ${sanitized.happiness}`);
    }
  } else if (data.happiness !== undefined) {
    errors.push('Happiness must be a number');
  }

  // Validate hunger
  if (typeof data.hunger === 'number') {
    sanitized.hunger = Math.max(PET_STATS_RANGE.min, Math.min(PET_STATS_RANGE.max, data.hunger));
    if (data.hunger !== sanitized.hunger) {
      errors.push(`Hunger corrected from ${data.hunger} to ${sanitized.hunger}`);
    }
  } else if (data.hunger !== undefined) {
    errors.push('Hunger must be a number');
  }

  // Validate cleanliness
  if (typeof data.cleanliness === 'number') {
    sanitized.cleanliness = Math.max(PET_STATS_RANGE.min, Math.min(PET_STATS_RANGE.max, data.cleanliness));
    if (data.cleanliness !== sanitized.cleanliness) {
      errors.push(`Cleanliness corrected from ${data.cleanliness} to ${sanitized.cleanliness}`);
    }
  } else if (data.cleanliness !== undefined) {
    errors.push('Cleanliness must be a number');
  }

  // Validate energy
  if (typeof data.energy === 'number') {
    sanitized.energy = Math.max(PET_STATS_RANGE.min, Math.min(PET_STATS_RANGE.max, data.energy));
    if (data.energy !== sanitized.energy) {
      errors.push(`Energy corrected from ${data.energy} to ${sanitized.energy}`);
    }
  } else if (data.energy !== undefined) {
    errors.push('Energy must be a number');
  }

  // Validate coins
  if (typeof data.coins === 'number') {
    sanitized.coins = Math.max(COINS_RANGE.min, Math.min(COINS_RANGE.max, Math.floor(data.coins)));
    if (data.coins !== sanitized.coins) {
      errors.push(`Coins corrected from ${data.coins} to ${sanitized.coins}`);
    }
  } else if (data.coins !== undefined) {
    errors.push('Coins must be a number');
  }

  // Validate lastUpdateTime
  if (typeof data.lastUpdateTime === 'number') {
    sanitized.lastUpdateTime = data.lastUpdateTime;
  } else if (data.lastUpdateTime !== undefined) {
    errors.push('LastUpdateTime must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized,
  };
};

// User data validation
export const validateUserData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitized: UserData = {
    email: '',
    username: '',
  };

  // Validate email
  if (typeof data.email === 'string') {
    const email = sanitizeString(data.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(email)) {
      sanitized.email = email.toLowerCase();
    } else {
      errors.push('Invalid email format');
    }
  } else {
    errors.push('Email is required and must be a string');
  }

  // Validate username
  if (typeof data.username === 'string') {
    const username = sanitizeString(data.username);
    const usernameRegex = /^[a-z0-9_]+$/;
    
    if (username.length >= USERNAME_LENGTH.min && username.length <= USERNAME_LENGTH.max) {
      if (usernameRegex.test(username)) {
        sanitized.username = username.toLowerCase();
      } else {
        errors.push('Username can only contain lowercase letters, numbers, and underscores');
      }
    } else {
      errors.push(`Username must be between ${USERNAME_LENGTH.min} and ${USERNAME_LENGTH.max} characters`);
    }
  } else {
    errors.push('Username is required and must be a string');
  }

  // Validate password (if provided)
  if (data.password !== undefined) {
    if (typeof data.password === 'string') {
      const password = data.password;
      if (password.length >= PASSWORD_LENGTH.min && password.length <= PASSWORD_LENGTH.max) {
        sanitized.password = password; // Don't sanitize passwords
      } else {
        errors.push(`Password must be between ${PASSWORD_LENGTH.min} and ${PASSWORD_LENGTH.max} characters`);
      }
    } else {
      errors.push('Password must be a string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized,
  };
};

// Database validation before save
export const validateBeforeSave = (data: any, type: 'pet' | 'user'): ValidationResult => {
  if (type === 'pet') {
    return validatePetState(data);
  } else if (type === 'user') {
    return validateUserData(data);
  }
  
  return {
    isValid: false,
    errors: ['Unknown validation type'],
  };
};

// Log validation errors
export const logValidationErrors = (errors: string[], context: string) => {
  if (errors.length > 0) {
    console.warn(`[Validation] ${context}:`, errors);
  }
};
