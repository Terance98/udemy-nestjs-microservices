let jwt: string;
describe('Reservations', () => {
  beforeAll(async () => {
    const user = {
      email: 'thomasterance98@gmail.com',
      password: 'Randomstrongpassword$$123',
    };

    // Creating a user
    await fetch('http://auth:3001/users', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Logging in as the same user
    const response = await fetch('http://auth:3001/auth/login', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Getting the jwt token from the response
    jwt = await response.text();
  });

  test('Create & Get', async () => {
    // Create a response and check if it succeeds
    const responseCreate = await createReservations();
    expect(responseCreate.ok).toBeTruthy();
    const createdReservation = await responseCreate.json();

    // Get the newly created reservation and match its data
    const responseGet = await fetch(
      `http://reservations:3000/reservations/${createdReservation._id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authentication: jwt,
        },
      },
    );

    const reservation = await responseGet.json();

    expect(createdReservation).toEqual(reservation);
  });
});

// Helper function
const createReservations = async () => {
  const createReservationPayload = {
    startDate: '12/10/2022',
    endDate: '12/25/2022',
    placeId: '123451',
    invoiceId: '493',
    extra: 'hello',
    charge: {
      amount: 45,
      card: {
        cvc: '413',
        exp_month: 12,
        exp_year: 2027,
        number: '4242 4242 4242 4242',
      },
    },
  };

  const response = await fetch('http://reservations:3000/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authentication: jwt,
    },
    body: JSON.stringify(createReservationPayload),
  });

  return response;
};
