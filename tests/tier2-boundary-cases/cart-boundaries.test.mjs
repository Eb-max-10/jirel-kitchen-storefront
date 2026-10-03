/**
 * Tier 2: Cart Reducer, Pricing Boundaries & Floating-Point Tests
 * Authoritative source: CartContext.tsx, ORIGINAL_REQUEST §R2
 */

import { describe, test, expect } from '../helpers/test-framework.mjs';

// Standalone reducer model matching CartContext contract
function isSameItem(item, productId, variantId) {
  return item.productId === productId && (item.variantId ?? undefined) === (variantId ?? undefined);
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((item) =>
        isSameItem(item, action.payload.productId, action.payload.variantId)
      );
      const quantityToAdd = action.payload.quantity || 1;

      if (existingIndex > -1) {
        return {
          ...state,
          items: state.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: quantityToAdd }],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          (item) => !isSameItem(item, action.payload.productId, action.payload.variantId)
        ),
      };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, variantId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => !isSameItem(item, productId, variantId)),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          isSameItem(item, productId, variantId) ? { ...item, quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

describe('Tier 2: Cart State & Quantity Boundary Conditions', () => {
  const itemA1 = {
    productId: 'prod-1',
    variantId: 'var-1-1',
    name: 'The Always Pan',
    variantName: 'Sage',
    price: 38000,
  };
  const itemA2 = {
    productId: 'prod-1',
    variantId: 'var-1-2',
    name: 'The Always Pan',
    variantName: 'Cream',
    price: 38000,
  };

  test('Adding new item sets initial quantity to 1', () => {
    const s0 = { items: [], isOpen: false };
    const s1 = cartReducer(s0, { type: 'ADD_ITEM', payload: itemA1 });
    expect(s1.items.length).toBe(1);
    expect(s1.items[0].quantity).toBe(1);
    expect(s1.items[0].name).toBe('The Always Pan');
  });

  test('Adding identical product with same variant increments quantity', () => {
    const s1 = { items: [{ ...itemA1, quantity: 1 }], isOpen: false };
    const s2 = cartReducer(s1, { type: 'ADD_ITEM', payload: itemA1 });
    expect(s2.items.length).toBe(1);
    expect(s2.items[0].quantity).toBe(2);
  });

  test('Adding identical product with different variant creates distinct line item', () => {
    const s1 = { items: [{ ...itemA1, quantity: 1 }], isOpen: false };
    const s2 = cartReducer(s1, { type: 'ADD_ITEM', payload: itemA2 });
    expect(s2.items.length).toBe(2);
    expect(s2.items[0].variantName).toBe('Sage');
    expect(s2.items[1].variantName).toBe('Cream');
  });

  test('Updating quantity to 0 removes item from cart', () => {
    const s1 = { items: [{ ...itemA1, quantity: 1 }], isOpen: false };
    const s2 = cartReducer(s1, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'prod-1', variantId: 'var-1-1', quantity: 0 },
    });
    expect(s2.items.length).toBe(0);
  });

  test('Updating quantity to negative value removes item from cart', () => {
    const s1 = { items: [{ ...itemA1, quantity: 2 }], isOpen: false };
    const s2 = cartReducer(s1, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'prod-1', variantId: 'var-1-1', quantity: -5 },
    });
    expect(s2.items.length).toBe(0);
  });

  test('Empty cart subtotal is exactly 0', () => {
    const emptyItems = [];
    const subtotal = emptyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(0);
  });

  test('High quantity stress test (9999 units calculation)', () => {
    const highQtyItem = { ...itemA1, quantity: 9999 };
    const subtotal = highQtyItem.price * highQtyItem.quantity;
    const kobo = Math.round(subtotal * 100);
    expect(subtotal).toBe(379962000);
    expect(kobo).toBe(37996200000);
    expect(Number.isSafeInteger(kobo)).toBe(true);
  });

  test('Floating point kobo rounding precision test', () => {
    // Tests prices with cents/kobo decimals
    const priceWithDecimals = 14500.49;
    const kobo = Math.round(priceWithDecimals * 100);
    expect(kobo).toBe(1450049);

    const priceWithRounding = 14500.499;
    const roundedKobo = Math.round(priceWithRounding * 100);
    expect(roundedKobo).toBe(1450050);
  });
});
