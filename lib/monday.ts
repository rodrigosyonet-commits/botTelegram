
const MONDAY_API_KEY = process.env.MONDAY_API_KEY!;

export const BOARD_ID = 18422912060;

// ==============================
// MONDAY QUERY
// ==============================

export async function mondayQuery(query: string) {
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

  if (data.errors) {
    console.error("MONDAY ERROR:", data.errors);
    throw new Error(JSON.stringify(data.errors));
  }

  return data.data;
}

// ==============================
// CREAR INCIDENCIA
// ==============================

export async function createIncident({
  applicant,
  telegramId,
  priority,
  description,
}: {
  applicant: string;
  telegramId: string;
  priority: string;
  description: string;
}) {
  const columnValues = JSON.stringify({
    color_mm5hpkcz: {
      label: "Whatsapp",
    },

    color_mm5ehr79: {
      label: "Nuevo",
    },

    text_mm5gsejq: applicant,
  });

  const mutation = `
    mutation {
      create_item(
        board_id: ${BOARD_ID},
        item_name: ${JSON.stringify(
          description.substring(0, 120)
        )},
        column_values: ${JSON.stringify(columnValues)}
      ) {
        id
        name
      }
    }
  `;

  const result = await mondayQuery(mutation);

  const itemId = result.create_item.id;

  await createUpdate(
    itemId,
`🚨 NUEVA INCIDENCIA

👤 Solicitante:
${applicant}

🆔 Telegram:
${telegramId}

⚠️ Prioridad:
${priority}

📝 Descripción:

${description}`
  );

  return result.create_item;
}

// ==============================
// CREAR UPDATE
// ==============================

export async function createUpdate(
  itemId: string,
  text: string
) {
  const mutation = `
    mutation {
      create_update(
        item_id: ${itemId},
        body: ${JSON.stringify(text)}
      ) {
        id
      }
    }
  `;

  return await mondayQuery(mutation);
}

// ==============================
// CONSULTAR TICKET
// ==============================

export async function getTicket(
  itemId: string
) {
  const query = `
    query {
      items(ids: [${itemId}]) {
        id
        name
        created_at
        column_values {
          id
          text
        }
      }
    }
  `;

  const result = await mondayQuery(query);

  return result.items?.[0] || null;
}

// ==============================
// LISTAR TICKETS DE USUARIO
// ==============================

export async function findTicketsByApplicant(
  applicant: string
) {

  const query = `
    query {
      boards(ids: [${BOARD_ID}]) {
        items_page(limit: 100) {
          items {
            id
            name
            column_values {
              id
              text
            }
          }
        }
      }
    }
  `;

  const data = await mondayQuery(query);

  const items =
    data.boards?.[0]?.items_page?.items || [];

  return items.filter(
    (item: any) =>
      item.column_values.some(
        (col: any) =>
          col.id === "text_mm5gsejq" &&
          col.text === applicant
      )
  );
}

// ==============================
// CAMBIAR ESTADO
// ==============================

export async function updateStatus(
  itemId: string,
  status: string
) {
  const values = JSON.stringify({
    color_mm5ehr79: {
      label: status,
    },
  });

  const mutation = `
    mutation {
      change_multiple_column_values(
        board_id: ${BOARD_ID},
        item_id: ${itemId},
        column_values: ${JSON.stringify(values)}
      ) {
        id
      }
    }
  `;

  return await mondayQuery(mutation);
}
