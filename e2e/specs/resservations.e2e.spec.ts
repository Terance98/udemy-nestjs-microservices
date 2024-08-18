describe('Reservations', () => {
  beforeAll(async () => {
    const user = {
      email: 'thomasterance98@gmail.com',
      password: 'Randomstrongpassword$$123',
    };

    const loginResponse = await fetch('http://auth:3001/login', {
      method: 'POST',
      body: JSON.stringify(user),
    });

    console.log({ loginResponse });
  });
  test('Create');
});
