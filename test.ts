import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import {
  HashicupsProvider,
  Order,
  DataHashicupsOrder,
  DataHashicupsCoffees,
  DataHashicupsIngredients,
  DataHashicupsCoffeesCoffeesList,
} from 'cdktf-provider-hashicups/v0.3.1';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const provider = new HashicupsProvider(this, 'hashicups', {
      serverAddress: 'http://localhost:19090',
    });

    const order = new Order(this, 'order', {
      customerId: '123',
      coffeeId: '456',
      ingredients: ['milk', 'sugar'],
      quantity: 2,
    });

    const dataHashicupsOrder = new DataHashicupsOrder(this, 'data-hashicups-order', {
      id: order.id,
      provider: provider,
    });

    const dataHashicupsCoffees = new DataHashicupsCoffees(this, 'data-hashicups-coffees', {
      provider: provider,
    });

    const dataHashicupsIngredients = new DataHashicupsIngredients(this, 'data-hashicups-ingredients', {
      provider: provider,
    });

    const dataHashicupsCoffeesCoffeesList = new DataHashicupsCoffeesCoffeesList(this, 'data-hashicups-coffees-list', {
      provider: provider,
    });

    // Outputs
    new TerraformOutput(this, 'order-id', {
      value: order.id,
    });

    new TerraformOutput(this, 'coffee-name', {
      value: dataHashicupsCoffees.getNameById('456'),
    });

    new TerraformOutput(this, 'ingredients', {
      value: dataHashicupsIngredients.getNamesByIds(['milk', 'sugar']).join(','),
    });

    new TerraformOutput(this, 'coffee-list', {
      value: dataHashicupsCoffeesCoffeesList.getList().join(','),
    });
  }
}

const app = new App();
new MyStack(app, 'my-stack');
app.synth();
