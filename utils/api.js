export const apiResponse = {
    success: (res, data, status = 200) => {
      return res.status(status).json({
        success: true,
        ...data
      });
    },
  
    error: (res, message, status = 500) => {
      return res.status(status).json({
        success: false,
        message
      });
    },
  
    validate: (data, rules) => {
      for (const [field, rule] of Object.entries(rules)) {
        if (rule.required && !data[field]) {
          return `${field} is required`;
        }
        if (rule.min && data[field] < rule.min) {
          return `${field} must be at least ${rule.min}`;
        }
        if (rule.max && data[field] > rule.max) {
          return `${field} must not exceed ${rule.max}`;
        }
      }
      return null;
    }
  };