require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT} | env: ${process.env.NODE_ENV || 'development'}`);
});
