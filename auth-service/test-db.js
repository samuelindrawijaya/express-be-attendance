const { testConnection } = require('../shared/config/database');

(async () => {
  await testConnection();
})();