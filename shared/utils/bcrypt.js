const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Hash plain password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare input password with hashed password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePassword
};



