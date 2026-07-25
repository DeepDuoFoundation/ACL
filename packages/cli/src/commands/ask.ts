import { NLIV3Engine } from "@litho/nli-v3";

const nli = new NLIV3Engine();
const sessionId = `ask_${Date.now()}`;

export async function askCommand(query: string) {
  const response = await nli.processMessage(sessionId, "cli-user", query);
  if (response.needsClarification && response.clarificationQuestions.length > 0) {
    console.log(`\n${response.message}\n`);
    for (const q of response.clarificationQuestions) {
      console.log(`  ? ${q.question}`);
    }
    console.log("");
  }
  console.log(response.message);
}
