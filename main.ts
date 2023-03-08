import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import {
  provider,
  order,
  dataHashicupsOrder,
  dataHashicupsCoffees,
  // dataHashicupsIngredients,
} from './.gen/providers/hashicups';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    const hashicupsProvider = new provider.HashicupsProvider(
      this,
      'hushicups',
      {
        username: 'admin',
        password: 'admin',
        host: 'https://localhost:8080',
      }
    );

    const orderItems: order.OrderConfig = {
      items: [
        {
          coffee: {
            id: 1,
          },
          quantity: 2,
        },
        {
          coffee: {
            id: 2,
          },
          quantity: 4,
        },
      ],
    };

    const newOrder = new order.Order(this, 'order', {
      provider: hashicupsProvider,
      lastUpdated: new Date().toISOString(),
      ...orderItems,
    });

    new dataHashicupsOrder.DataHashicupsOrder(this, 'getorder', {
      provider: hashicupsProvider,
      id: +newOrder.id,
    });

    new order.Order(this, 'updateorder', {
      provider: hashicupsProvider,
      id: newOrder.id,
      lastUpdated: new Date().toISOString(),
      ...orderItems,
    });

    new order.Order(this, 'deleteorder', {
      provider: hashicupsProvider,
      id: newOrder.id,
      lastUpdated: new Date().toISOString(),
      items: [],
    });

    new dataHashicupsCoffees.DataHashicupsCoffees(this, 'getcoffees', {
      provider: hashicupsProvider,
    });

    // new dataHashicupsIngredients.DataHashicupsIngredients(
    //   this,
    //   'getingredients',
    //   {
    //     provider: hashicupsProvider,
    //   }
    // );
  }
}

const app = new App();
new MyStack(app, 'typescript-hushicups');
app.synth();
