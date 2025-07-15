// shared/utils/errors/InvalidCredentialsError.js
class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
    this.code = 'INVALID_CREDENTIALS';
    this.statusCode = 401;
  }
}

module.exports = InvalidCredentialsError;
