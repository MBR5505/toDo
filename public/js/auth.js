// Check token validity and handle auto-refresh
document.addEventListener('DOMContentLoaded', function() {
  // This could be extended with token refresh functionality
  // For now, just checking if authentication-related errors appear
  
  // Listen for auth-related error messages
  const errorElem = document.querySelector('.error-message');
  if (errorElem && errorElem.textContent.includes('authentication')) {
    // If there's an authentication error, redirect to login
    window.location.href = '/auth/login';
  }
});
