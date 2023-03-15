import * as fs from 'fs';
import { spawn } from 'child_process';

const filePath = './orders.json';

fs.watchFile(filePath, () => {
  const cmd = spawn('cdktf', ['deploy'], { stdio: 'inherit' });
  cmd.stdout &&
    cmd.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

  cmd.stderr &&
    cmd.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

  cmd.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
});
