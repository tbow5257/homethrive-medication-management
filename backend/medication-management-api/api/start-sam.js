const { execSync } = require('child_process');

// Get the command to run
let command = 'sam local start-api --env-vars env.json';

// If DOCKER_HOST is set, include it in the command
if (process.env.DOCKER_HOST) {
  command = `DOCKER_HOST=${process.env.DOCKER_HOST} ${command}`;
}

// Run the command
try {
  execSync(command, { stdio: 'inherit', cwd: '.' });
} catch (error) {
  console.error('=================');
  console.error('Check the error message above for details.');
  process.exit(1);
}
