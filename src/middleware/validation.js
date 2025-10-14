import Joi from 'joi';
import { ValidationError } from '../utils/index.js';

// Strong password schema
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    'any.required': 'Password is required'
  });

// Email schema
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(320)
  .lowercase() // Automatically lowercase emails
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 320 characters',
    'any.required': 'Email is required'
  });

// Name schema
const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .trim() // Remove whitespace
  .pattern(new RegExp('^[a-zA-Z\\s]+$'))
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters and spaces',
    'any.required': 'Name is required'
  });

// Registration validation schema
export const registerSchema = Joi.object({
  token: Joi.string().trim().required(),
  name: nameSchema,
  password: passwordSchema
});

// Login validation schema
export const loginSchema = Joi.object({
  email: emailSchema,
  // password: passwordSchema
  password: Joi.string().min(6).required()
});

// Password reset schemas
export const passwordResetRequestSchema = Joi.object({
  email: emailSchema
});

export const passwordResetConfirmSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: passwordSchema
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
			console.log(error)
      // const errors = error.details.map(detail => ({
      //   field: detail.path.join('.'),
      //   message: detail.message
      // }));
			const errorMsg = error.details[0].message

			return next(new ValidationError(errorMsg))
			
    }

    // Replace req.body with validated/cleaned value
    req.body = value;
    next();
  };
};
