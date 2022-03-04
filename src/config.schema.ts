import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number()
    .default(3000)
    .required(),
  STAGE: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});
