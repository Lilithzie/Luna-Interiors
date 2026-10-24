export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

export const validatePassword = (value) => {
    const password = String(value || '')
    if (!password) return 'Password is required.'
    if (password.length < 8) return 'Password must be at least 8 characters long.'
    return ''
}

export const fieldErrorId = (field) => `${field}_error`
