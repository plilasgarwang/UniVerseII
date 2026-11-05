/** Turns Firebase error codes into messages a student can act on. */
export function friendlyAuthError(err: unknown): string {
  const code = (err as any)?.code as string | undefined;
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/invalid-api-key':
    case 'auth/configuration-not-found':
      return 'Firebase is not configured correctly. Check your .env file.';
    default:
      return (err as Error)?.message ?? 'Something went wrong. Please try again.';
  }
}
