const PHONE_REGEX = /^[\d\s\-+()]{10,20}$/
const VALID_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'other']

const trimText = (value) => (typeof value === 'string' ? value.trim() : '')

export const createInitialEmergencyRequestForm = () => ({
  type: 'medical_emergency',
  description: '',
  address: '',
  landmark: '',
  city: '',
  state: '',
  peopleAffected: 1,
  alternativeContact: '',
  hasInjuries: false,
  injuryDetails: '',
  needsAmbulance: false,
  hasMobilityIssues: false,
  accessibilityDetails: '',
  preferredLanguage: 'en',
  needsTranslator: false,
  otherRequirements: ''
})

export const validateEmergencyRequestForm = (form) => {
  const errors = {}

  const description = trimText(form.description)
  const address = trimText(form.address)
  const city = trimText(form.city)
  const state = trimText(form.state)
  const alternativeContact = trimText(form.alternativeContact)
  const injuryDetails = trimText(form.injuryDetails)
  const accessibilityDetails = trimText(form.accessibilityDetails)
  const otherRequirements = trimText(form.otherRequirements)
  const peopleAffected = Number.parseInt(form.peopleAffected, 10)

  if (!description) {
    errors.description = 'Description is required'
  } else if (description.length < 15) {
    errors.description = 'Please describe the emergency in at least 15 characters'
  } else if (description.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters'
  }

  if (!address) {
    errors.address = 'Address is required'
  } else if (address.length < 5) {
    errors.address = 'Address must be at least 5 characters'
  } else if (address.length > 200) {
    errors.address = 'Address cannot exceed 200 characters'
  }

  if (!city) {
    errors.city = 'City is required'
  } else if (city.length < 2) {
    errors.city = 'City must be at least 2 characters'
  } else if (city.length > 100) {
    errors.city = 'City cannot exceed 100 characters'
  }

  if (!state) {
    errors.state = 'State is required'
  } else if (state.length < 2) {
    errors.state = 'State must be at least 2 characters'
  } else if (state.length > 100) {
    errors.state = 'State cannot exceed 100 characters'
  }

  if (!Number.isInteger(peopleAffected)) {
    errors.peopleAffected = 'People affected must be a whole number'
  } else if (peopleAffected < 1) {
    errors.peopleAffected = 'People affected must be at least 1'
  } else if (peopleAffected > 1000) {
    errors.peopleAffected = 'People affected cannot exceed 1000'
  }

  if (alternativeContact && !PHONE_REGEX.test(alternativeContact)) {
    errors.alternativeContact = 'Alternative contact must be a valid phone number'
  }

  if (form.hasInjuries) {
    if (!injuryDetails) {
      errors.injuryDetails = 'Please describe the injuries'
    } else if (injuryDetails.length < 5) {
      errors.injuryDetails = 'Injury details must be at least 5 characters'
    } else if (injuryDetails.length > 500) {
      errors.injuryDetails = 'Injury details cannot exceed 500 characters'
    }
  }

  if (form.hasMobilityIssues) {
    if (!accessibilityDetails) {
      errors.accessibilityDetails = 'Please describe the accessibility need'
    } else if (accessibilityDetails.length < 5) {
      errors.accessibilityDetails = 'Accessibility details must be at least 5 characters'
    } else if (accessibilityDetails.length > 500) {
      errors.accessibilityDetails = 'Accessibility details cannot exceed 500 characters'
    }
  }

  if (otherRequirements.length > 500) {
    errors.otherRequirements = 'Other requirements cannot exceed 500 characters'
  }

  if (!VALID_LANGUAGES.includes(form.preferredLanguage)) {
    errors.preferredLanguage = 'Please choose a valid preferred language'
  }

  return errors
}

export const buildEmergencyRequestPayload = (form) => ({
  type: form.type,
  description: trimText(form.description),
  peopleAffected: Number.parseInt(form.peopleAffected, 10),
  citizenInfo: {
    alternativeContact: trimText(form.alternativeContact)
  },
  location: {
    address: trimText(form.address),
    landmark: trimText(form.landmark),
    city: trimText(form.city),
    state: trimText(form.state)
  },
  specialRequirements: {
    medical: {
      hasInjuries: Boolean(form.hasInjuries),
      injuryDetails: form.hasInjuries ? trimText(form.injuryDetails) : '',
      needsAmbulance: Boolean(form.needsAmbulance)
    },
    accessibility: {
      hasMobilityIssues: Boolean(form.hasMobilityIssues),
      details: form.hasMobilityIssues ? trimText(form.accessibilityDetails) : ''
    },
    language: {
      preferred: VALID_LANGUAGES.includes(form.preferredLanguage) ? form.preferredLanguage : 'en',
      needsTranslator: Boolean(form.needsTranslator)
    },
    other: trimText(form.otherRequirements)
  }
})

export const mapEmergencyValidationErrors = (errors = []) => {
  const fieldMap = {
    description: 'description',
    peopleAffected: 'peopleAffected',
    'location.address': 'address',
    'location.city': 'city',
    'location.state': 'state',
    'citizenInfo.alternativeContact': 'alternativeContact',
    'specialRequirements.medical.injuryDetails': 'injuryDetails',
    'specialRequirements.accessibility.details': 'accessibilityDetails',
    'specialRequirements.other': 'otherRequirements',
    'specialRequirements.language.preferred': 'preferredLanguage'
  }

  return (errors || []).reduce((accumulator, error) => {
    const fieldName = fieldMap[error?.field]
    if (fieldName && error?.message && !accumulator[fieldName]) {
      accumulator[fieldName] = error.message
    }
    return accumulator
  }, {})
}
