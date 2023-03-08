import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { HashicupsProvider } from './.gen/providers/hashicups/provider';
import { Order, OrderConfig } from './.gen/providers/hashicups/order';
import { DataHashicupsOrder } from './.gen/providers/hashicups/data-hashicups-order';
import { DataHashicupsCoffees } from './.gen/providers/hashicups/data-hashicups-coffees';
import { DataHashicupsIngredients } from './.gen/providers/hashicups/data-hashicups-ingredients';
class HashicupsCrudApi extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    const hashicupsProvider = new HashicupsProvider(this, 'hushicups', {
      username: 'admin',
      password: 'admin',
      host: 'https://localhost:19090',
    });

    const orderItems: OrderConfig = {
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

    const order = new Order(this, 'order', {
      provider: hashicupsProvider,
      lastUpdated: new Date().toISOString(),
      ...orderItems,
    });

    new DataHashicupsOrder(this, 'getorder', {
      provider: hashicupsProvider,
      id: +order.id,
    });

    const coffeeData = new DataHashicupsCoffees(this, 'coffees', {
      provider: hashicupsProvider,
    });

    new DataHashicupsIngredients(this, 'ingredients', {
      provider: hashicupsProvider,
      coffeeId: +coffeeData.id,
    });
  }
}

const app = new App();
new HashicupsCrudApi(app, 'typescript-hushicups');
app.synth();
