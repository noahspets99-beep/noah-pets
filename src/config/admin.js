/** Authorized Noah Pets administrator (Firebase Auth email). */
export const ADMIN_EMAIL = 'noahspets99@gmail.com'

export function isAdminUser(user) {
  return Boolean(
    user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  )
}
