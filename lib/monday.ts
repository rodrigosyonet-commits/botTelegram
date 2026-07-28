const MONDAY_API_KEY =
  process.env.MONDAY_API_KEY!;

export async function createTicket(
  description: string,
  requesterName: string,
  email: string,
  contactNumber: string,
  latitude: number,
  longitude: number
) {
  const values = {
    color_mm5hpkcz: {
      label: "WhatsApp",
    },

    color_mm5ehr79: {
      label: "Nuevo",
    },

    text_mm5gsejq: requesterName,

    text_mm5pw674: contactNumber,

    email_mm5gdxzz: {
      email,
      text: email,
    },

    location_mm5gh4kh: {
      lat: latitude,
      lng: longitude,
      address:
        "Ubicación compartida desde Telegram",
    },
  };

  const query = `
    mutation {
      create_item(
        board_id: 18422912060,
        item_name: ${JSON.stringify(description)},
        column_values: ${JSON.stringify(
          JSON.stringify(values)
        )}
      ) {
        id
        name
      }
    }
  `;

  console.log("MONDAY QUERY:", query);

  const response = await fetch(
    "https://api.monday.com/v2",
    {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    }
  );

  const data = await response.json();

  console.log(
    "MONDAY RESPONSE:",
    JSON.stringify(data, null, 2)
  );

  if (data.errors) {
    throw new Error(
      JSON.stringify(data.errors)
    );
  }

  return data;
}
