const HCDC_EMAIL_DOMAIN = 'hcdc.edu.ph'

export function normalizeHcdcEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidHcdcEmail(email: string): boolean {
  return /^[a-z0-9]+(?:[a-z0-9._-]*[a-z0-9])?\.[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?@hcdc\.edu\.ph$/.test(normalizeHcdcEmail(email))
}

export function expectedHcdcEmailFromName(fullName: string): string {
  const parts = fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)

  if (parts.length < 2) return ''

  const lastName = parts[parts.length - 1]
  const givenNames = parts.slice(0, -1).join('')
  return `${givenNames}.${lastName}@${HCDC_EMAIL_DOMAIN}`
}

export function validateHcdcEmailForName(email: string, fullName: string): string | null {
  const normalizedEmail = normalizeHcdcEmail(email)
  const expectedEmail = expectedHcdcEmailFromName(fullName)

  if (!normalizedEmail) return 'HCDC email address is required.'
  if (!isValidHcdcEmail(normalizedEmail)) {
    return 'Use your HCDC email: firstname.lastname@hcdc.edu.ph.'
  }
  if (expectedEmail && normalizedEmail !== expectedEmail) {
    return `Email must match your full name: ${expectedEmail}.`
  }

  return null
}
