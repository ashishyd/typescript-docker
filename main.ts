import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { HashicupsProvider } from './.gen/providers/hashicups/provider';
import { Order } from './.gen/providers/hashicups/order';
import { DataHashicupsOrder } from './.gen/providers/hashicups/data-hashicups-order';
import { DataHashicupsCoffees } from './.gen/providers/hashicups/data-hashicups-coffees';
import { DataHashicupsIngredients } from './.gen/providers/hashicups/data-hashicups-ingredients';
import * as fs from 'fs';
import * as path from 'path';
// import { exec } from 'child_process';
interface FolderInfo {
  name: string;
  level: number;
  items: FileInfo[];
}

interface FileInfo {
  name: string;
  level: number;
  isFile: boolean;
  path: string;
}

class HashicupsCrudApi extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const folderInfos: FolderInfo[] = [];

    function readDirRecursive(dir: string, level: number = 0): FolderInfo[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          folderInfos.push({
            name: file,
            level: level,
            items: [],
          });
          readDirRecursive(filePath, level + 1);
        } else {
          const parentFolderName: string = path.basename(
            path.dirname(filePath)
          );
          const index = folderInfos.findIndex(
            (info) => info.name.toLowerCase() === parentFolderName.toLowerCase()
          );
          if (index > -1) {
            folderInfos[index].items.push({
              name: file.split('.')[0],
              level,
              isFile: true,
              path: filePath,
            });
          }
        }
      }
      return folderInfos;
    }

    const paths = readDirRecursive('./orders');

    // provider
    const hashicupsProvider = new HashicupsProvider(this, 'hushicups', {
      username: 'ashish',
      password: 'ashish',
      host: 'http://localhost:19090',
    });

    paths.forEach((path) => {
      if (path.level === 0) {
        const names = path.name.split('-');
        new DataHashicupsOrder(this, 'order-data-' + +names[1], {
          provider: hashicupsProvider,
          id: +names[1] ?? 1,
        });
        const orderItems = {
          items: path.items
            .filter((item) => item.level > 0 && item.isFile)
            .map((item, index) => {
              const coffeeId = item.name;
              const jsonQuantity = fs.readFileSync(item.path, 'utf8');
              const jsonQuantityData = JSON.parse(jsonQuantity);

              new DataHashicupsCoffees(this, names + '-coffee-' + index, {
                provider: hashicupsProvider,
              });
              new DataHashicupsIngredients(
                this,
                names + '-ingredient-' + index,
                {
                  provider: hashicupsProvider,
                  coffeeId: +coffeeId,
                }
              );

              return {
                coffee: { id: +coffeeId },
                quantity: jsonQuantityData.quantity,
              };
            }),
        };

        new Order(this, path.name, {
          provider: hashicupsProvider,
          ...orderItems,
        });
      }
    });

    // const filePath = './orders.json';

    // if (fs.existsSync(filePath)) {
    //   // Read the contents of the JSON file
    //   const jsonOrders = fs.readFileSync(filePath, 'utf-8');
    //   try {
    //     // Parse the JSON string into a JavaScript object
    //     jsonOrderData = JSON.parse(jsonOrders);
    //   } catch (err) {
    //     console.log(`Not a json file`);
    //   }
    // } else {
    //   fs.writeFileSync(filePath, JSON.stringify(jsonOrderData));
    // }

    // fs.watchFile(filePath, () => {
    //   exec('cdktf deploy', (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`Error: ${error.message}`);
    //       return;
    //     }
    //     if (stderr) {
    //       console.error(`Error: ${stderr}`);
    //       return;
    //     }
    //     console.log(`Output: ${stdout}`);
    //   });
    // });
  }
}

const app = new App();
const api = new HashicupsCrudApi(app, 'typescript-hashicups-dev');
api.toTerraform();
app.synth();
