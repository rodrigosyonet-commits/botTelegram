const MONDAY_API_KEY = process.env.MONDAY_API_KEY;

export async function createTicket(
  description: string,
  requesterName: string
) {

  const values = JSON.stringify({
    color_mm5hpkcz: {
      label: "Telegram"
    },
    color_mm5ehr79: {
      label: "Nuevo"
    },
    text_mm5gsejq: requesterName
  });

  const query = `
    mutation {
      create_item(
        board_id: 18422912060,
        item_name: ${JSON.stringify(description)},
        column_values: ${JSON.stringify(values)}
      ) {
        id
        name
      }
    }
  `;

  const response = await fetch(
    "https://api.monday.com/v2",
    {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_KEY!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query
      })
    }
  );

  const data = await response.json();

  return data;
}
