'use strict';

const app = require('./app');

async function init() {
  try {
    app.listen(3001, () => {
      console.log('Express App Listening on Port 3001'); // eslint-disable-line no-console
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`); // eslint-disable-line no-console
    process.exit(1);
  }
}

init();
