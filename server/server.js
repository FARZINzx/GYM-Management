import env from './src/config/env.js';
import app from './src/app.js';

app.listen(env.PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});