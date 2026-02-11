import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email is invalid',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Password confirmation is required',
    }),
  role: Joi.string()
    .valid('investor', 'entrepreneur')
    .required()
    .messages({
      'any.only': 'Role must be either investor or entrepreneur',
      'any.required': 'Role is required',
    }),
  phone: Joi.string()
    .optional()
    .regex(/^[\d\s\-\+\(\)]+$/)
    .messages({
      'string.pattern.base': 'Phone number is invalid',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email is invalid',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message);
    return { valid: false, errors: messages };
  }
  return { valid: true, data: value };
};
