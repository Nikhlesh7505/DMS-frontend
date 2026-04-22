import * as Yup from 'yup';

// Reusable validation rules
const emailRule = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

const passwordRule = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Must contain at least one lowercase letter')
  .matches(/[0-9]/, 'Must contain at least one number')
  .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character')
  .required('Password is required');

const phoneRule = Yup.string()
  .matches(/^(\+91[\-\s]?)?[6789]\d{9}$/, 'Invalid Indian phone number')
  .required('Phone number is required');

const usernameRule = Yup.string()
  .matches(/^(?=.{3,30}$)[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/, 'Username must be 3-30 characters and use only lowercase letters, numbers, dots, or underscores')
  .required('Username is required');

// Auth Schemas
export const loginSchema = Yup.object().shape({
  email: emailRule,
  password: Yup.string().required('Password is required'),
});

export const forgotPasswordEmailSchema = Yup.object().shape({
  email: emailRule,
});

export const forgotPasswordResetSchema = Yup.object().shape({
  email: emailRule,
  otp: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
  password: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export const recoverEmailByPhoneSchema = Yup.object().shape({
  phone: phoneRule,
});

export const recoverEmailByUsernameSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .required('Username is required'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(100, 'Name is too long')
    .required('Full name is required'),
  username: usernameRule,
  email: emailRule,
  phone: phoneRule,
  role: Yup.string()
    .oneOf(['citizen', 'ngo', 'rescue_team', 'volunteer'], 'Invalid role')
    .required('Account type is required'),
  organizationName: Yup.string().when('role', {
    is: (val) => val === 'ngo' || val === 'rescue_team',
    then: (schema) => schema.required('Organization name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  location: Yup.object().shape({
    address: Yup.string().notRequired(),
    city: Yup.string().notRequired(),
    state: Yup.string().notRequired(),
    coordinates: Yup.object().shape({
      latitude: Yup.number().nullable().notRequired(),
      longitude: Yup.number().nullable().notRequired(),
    }).notRequired(),
  }).notRequired(),
  password: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

// Emergency Request Schema
export const emergencyRequestSchema = Yup.object().shape({
  type: Yup.string().required('Emergency type is required'),
  description: Yup.string()
    .min(15, 'Please provide more details (min 15 characters)')
    .max(1000, 'Description is too long')
    .required('Description is required'),
  peopleAffected: Yup.number()
    .typeError('Must be a number')
    .min(1, 'Minimum 1 person affected')
    .required('People affected is required'),
  location: Yup.object().shape({
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    landmark: Yup.string().notRequired(),
    coordinates: Yup.object().shape({
      latitude: Yup.number().required('Latitude is required'),
      longitude: Yup.number().required('Longitude is required'),
    }).required('Location coordinates are required'),
  }),
  citizenInfo: Yup.object().shape({
    alternativeContact: Yup.string()
      .matches(/^(\+91[\-\s]?)?[6789]\d{9}$/, 'Invalid Indian phone number')
      .notRequired(),
  }),
  specialRequirements: Yup.object().shape({
    medical: Yup.object().shape({
      hasInjuries: Yup.boolean().default(false),
      injuryDetails: Yup.string().when('hasInjuries', {
        is: true,
        then: (schema) => schema.min(5, 'Please describe injuries (min 5 chars)').required('Injury details are required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      needsAmbulance: Yup.boolean().default(false),
    }),
    accessibility: Yup.object().shape({
      hasMobilityIssues: Yup.boolean().default(false),
      details: Yup.string().notRequired(),
    }),
    language: Yup.object().shape({
      preferred: Yup.string().default('en'),
      needsTranslator: Yup.boolean().default(false),
    }),
  }).notRequired(),
});

// Donation Schema
export const donationSchema = Yup.object().shape({
  country: Yup.string()
    .required('Country is required'),
  state: Yup.string()
    .required('State is required'),
  city: Yup.string()
    .required('City is required'),
  category: Yup.string()
    .oneOf(['clothes', 'money', 'food', 'medicine', 'water', 'other', 'medicines', 'others'], 'Invalid donation type')
    .required('Item type is required'),
  quantity: Yup.number()
    .typeError('Must be a number')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required'),
  description: Yup.string()
    .trim()
    .required('Description is required')
    .max(500, 'Description is too long'),
  contactDetails: Yup.string()
    .matches(/^\d{10}$/, 'Contact number must be exactly 10 digits')
    .required('Contact number is required'),
  pickupLocation: Yup.object().shape({
    address: Yup.string().trim().required('Address is required'),
  }),
});

// Volunteer Assignment Schema
export const volunteerAssignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .required('Volunteer name is required'),
  contact: phoneRule,
  expectedTime: Yup.date()
    .typeError('Invalid date format')
    .min(new Date(), 'Expected time must be in the future')
    .required('Expected completion time is required'),
});
