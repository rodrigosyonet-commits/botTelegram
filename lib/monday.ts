const MONDAY_API_KEY = process.env.MONDAY_API_KEY;

export async function createTicket(
  description: string,
  requesterName: string
) {
  const values = {
    color_mm5hpkcz: {
      label: "Telegram",
    },
    color_mm5ehr79: {
      label: "Nuevo",
    },
    text_mm5gsejq: requesterName,
  };

  const query = `
    mutation {
      create_item(
        board_id: 18422912060,
        item_name: ${JSON.stringify(description)},
        column_values: ${JSON.stringify(JSON.stringify(values))}
      ) {
        id
        name
      }
    }
  `;

  console.log("MONDAY QUERY:", query);

  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  console.log("MONDAY RESPONSE:", JSON.stringify(data, null, 2));

  if (data.errors) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data;
}
