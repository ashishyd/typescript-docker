import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { HashicupsProvider } from './.gen/providers/hashicups/provider';
import { Order, OrderConfig } from './.gen/providers/hashicups/order';
import { DataHashicupsOrder } from './.gen/providers/hashicups/data-hashicups-order';
// import { DataHashicupsCoffees } from './.gen/providers/hashicups/data-hashicups-coffees';
// import { DataHashicupsIngredients } from './.gen/providers/hashicups/data-hashicups-ingredients';
// import { orderItemsToTerraform } from './.gen/providers/hashicups/order/index';

class HashicupsCrudApi extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    const hashicupsProvider = new HashicupsProvider(this, 'hushicups', {
      username: 'education',
      password: 'test123',
      host: 'http://localhost:19090',
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

    const orderData = new DataHashicupsOrder(this, 'order-data', {
      provider: hashicupsProvider,
      id: 1,
    });

    new Order(this, 'order', {
      provider: hashicupsProvider,
      ...orderItems,
      dependsOn: [orderData],
    });

    // const coffee = new DataHashicupsCoffees(this, 'coffees', {
    //   provider: hashicupsProvider,
    //   dependsOn: [order],
    // });

    // new DataHashicupsIngredients(this, 'ingredients', {
    //   provider: hashicupsProvider,
    //   coffeeId: order.items.get(0).coffee.id,
    //   dependsOn: [coffee],
    // });
  }
}

const app = new App();
new HashicupsCrudApi(app, 'typescript-hashicups');
app.synth();
