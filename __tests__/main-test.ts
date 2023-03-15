// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { App, TerraformStack, Testing } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest'; // Load types for expect matchers
import { Order } from '../.gen/providers/hashicups/order';
// import { Testing } from "cdktf";
import { HashicupsProvider } from '../.gen/providers/hashicups/provider/index';
import { DataHashicupsOrder } from '../.gen/providers/hashicups/data-hashicups-order/index';
import { DataHashicupsCoffees } from '../.gen/providers/hashicups/data-hashicups-coffees/index';
import { DataHashicupsIngredients } from '../.gen/providers/hashicups/data-hashicups-ingredients/index';

describe('HashiCrudApi', () => {
  // The tests below are example tests, you can find more information at
  // https://cdk.tf/testing
  // it.todo("should be tested");
  let app: App;
  let stack: TerraformStack;
  let hashicupsProvider: HashicupsProvider;
  beforeEach(() => {
    app = Testing.app();
    stack = new TerraformStack(app, 'test');
    hashicupsProvider = new HashicupsProvider(stack, 'hashicups-provider', {
      username: 'test',
      password: 'test',
      host: 'http://localhost:19090',
    });
  });

  describe('Unit testing using snapshots', () => {
    it('Tests the snapshot', () => {
      new Order(stack, 'orders', {
        provider: hashicupsProvider,
        items: [
          {
            coffee: {
              id: 1,
            },
            quantity: 1,
          },
        ],
      });

      expect(Testing.synth(stack)).toMatchSnapshot();
    });

    it('Tests a combination of resources', () => {
      expect(
        Testing.synthScope((stack) => {
          new DataHashicupsOrder(stack, 'order-data', {
            provider: hashicupsProvider,
            id: 1,
          });

          new DataHashicupsCoffees(stack, 'coffees', {
            provider: hashicupsProvider,
          });

          new DataHashicupsIngredients(stack, 'ingredients', {
            provider: hashicupsProvider,
            coffeeId: 1,
          });
        })
      ).toMatchInlineSnapshot(`
"{
  "data": {
    "hashicups_coffees": {
      "coffees": {
        "provider": "hashicups"
      }
    },
    "hashicups_ingredients": {
      "ingredients": {
        "coffee_id": 1,
        "provider": "hashicups"
      }
    },
    "hashicups_order": {
      "order-data": {
        "id": 1,
        "provider": "hashicups"
      }
    }
  }
}"
`);
    });
  });

  describe('Checking validity', () => {
    it('check if the produced terraform configuration is valid', () => {
      new Order(stack, 'orders', {
        provider: hashicupsProvider,
        items: [
          {
            coffee: {
              id: 1,
            },
            quantity: 1,
          },
        ],
      });

      new DataHashicupsOrder(stack, 'order-data', {
        provider: hashicupsProvider,
        id: 1,
      });

      new DataHashicupsCoffees(stack, 'coffees', {
        provider: hashicupsProvider,
      });

      new DataHashicupsIngredients(stack, 'ingredients', {
        provider: hashicupsProvider,
        coffeeId: 1,
      });
      expect(Testing.fullSynth(stack)).toBeValidTerraform();
    });

    it('check if this can be planned', () => {
      new Order(stack, 'orders', {
        provider: hashicupsProvider,
        items: [
          {
            coffee: {
              id: 1,
            },
            quantity: 1,
          },
        ],
      });

      new DataHashicupsOrder(stack, 'order-data', {
        provider: hashicupsProvider,
        id: 1,
      });

      new DataHashicupsCoffees(stack, 'coffees', {
        provider: hashicupsProvider,
      });

      new DataHashicupsIngredients(stack, 'ingredients', {
        provider: hashicupsProvider,
        coffeeId: 1,
      });
      stack.toTerraform();
      expect(Testing.fullSynth(stack)).toPlanSuccessfully();
    });
  });
});
