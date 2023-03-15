import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

// const filePath = './orders.json';

// fs.watchFile(filePath, () => {
//   const cmd = spawn('cdktf', ['deploy'], { stdio: 'inherit' });
//   cmd.stdout &&
//     cmd.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });

//   cmd.stderr &&
//     cmd.stderr.on('data', (data) => {
//       console.error(`stderr: ${data}`);
//     });

//   cmd.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// });

function watchFolder(folder: string) {
  fs.readdir(folder, { withFileTypes: true }, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(folder, file.name);

      if (file.isDirectory()) {
        watchFolder(filePath); // recursively watch subfolders
      } else {
        fs.watchFile(filePath, (curr, prev) => {
          if (curr.mtime !== prev.mtime) {
            fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) throw err;
              if (data.length > 0) {
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
              }
            });
          }
        });
      }
    });
  });
}

watchFolder('./orders');
