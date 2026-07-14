// Basic email shape check: something@something.tld with no whitespace. This is
// intentionally lenient — it catches obvious typos on the frontend while the
// server remains the source of truth for real address validity.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

export function validateFirstName(firstName: string): string | null {
  if (!firstName.trim()) {
    return "First name can't be blank";
  }

  return null;
}

export function validateLastName(lastName: string): string | null {
  if (!lastName.trim()) {
    return "Last name can't be blank";
  }

  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return "Email can't be blank";
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address";
  }

  return null;
}

export function validateSignupPassword(password: string): string | null {
  if (!password) {
    return "Password can't be blank";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return null;
}

export function validateRequiredPassword(password: string): string | null {
  if (!password) {
    return "Password can't be blank";
  }

  return null;
}
