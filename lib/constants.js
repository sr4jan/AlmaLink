export const DONATION_LIMITS = {
    MIN: process.env.NEXT_PUBLIC_MIN_DONATION || 100,
    MAX: process.env.NEXT_PUBLIC_MAX_DONATION || 100000
  };
  
  export const USER_TYPES = {
    STUDENT: 'Student',
    ALUMNI: 'Alumni',
    FACULTY: 'Faculty'
  };
  
  export const DONATION_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
  };