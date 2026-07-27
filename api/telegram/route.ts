
export async function POST(req: Request) {

  const body = await req.json();

  const chatId =
    body.message?.chat?.id;

  const text =
    body.message?.text;

  await processMessage(chatId, text);

  return Response.json({
    success: true
  });
}
