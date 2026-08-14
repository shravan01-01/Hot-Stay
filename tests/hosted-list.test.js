const test = require('node:test');
const assert = require('node:assert/strict');

const { getHostedPropertiesForUser } = require('../server/hostUtils');

test('filters hotel list to the current user email', () => {
  const hotels = [
    { name: 'Ocean View', hostEmail: 'alice@example.com' },
    { name: 'City Loft', hostEmail: 'bob@example.com' },
    { name: 'Mountain Cabin', hostEmail: 'alice@example.com' }
  ];

  const result = getHostedPropertiesForUser(hotels, 'alice@example.com');

  assert.deepStrictEqual(
    result.map((hotel) => hotel.name),
    ['Ocean View', 'Mountain Cabin']
  );
});
