import { POST } from "../src/app/api/chat/route";

async function testQuery(title: string, payload: any) {
  console.log(`\n========================================`);
  console.log(`TEST: ${title}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  try {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const res = await POST(req as any);
    const status = res.status;
    const contentType = res.headers.get("content-type");
    const sessionId = res.headers.get("x-chat-session-id");
    const rawBody = await res.text();
    console.log(`Status: ${status}`);
    console.log(`Content-Type: ${contentType}`);
    console.log(`x-chat-session-id: ${sessionId}`);
    console.log(`Raw Stream Body:`, JSON.stringify(rawBody));
  } catch (err: any) {
    console.error(`Error executing test:`, err.message || err);
  }
}

async function runAllTests() {
  // Test 1: Real Question 1 - Semester 1 courses
  await testQuery("1. Semester 1 courses", {
    messages: [{ role: "user", content: "What courses are offered in Semester 1?" }],
  });

  // Test 2: Real Question 2 - Department Info
  await testQuery("2. Department Info", {
    messages: [{ role: "user", content: "What is the Department of AI & Data Science?" }],
  });

  // Test 3: Real Question 3 - Subjects available
  await testQuery("3. Subjects available", {
    messages: [{ role: "user", content: "What subjects are available?" }],
  });

  // Test 4: Real Question 4 - Events
  await testQuery("4. Upcoming events", {
    messages: [{ role: "user", content: "What events are coming up?" }],
  });

  // Test 5: Real Question 5 - Tell me about department
  await testQuery("5. Tell me about department", {
    messages: [{ role: "user", content: "Tell me about the department." }],
  });

  // Test 6: Empty message
  await testQuery("6. Empty message", {
    messages: [{ role: "user", content: "   " }],
  });

  // Test 7: Null message content
  await testQuery("7. Null message content", {
    messages: [{ role: "user", content: null }],
  });

  // Test 8: Private password request (security test)
  await testQuery("8. Private password request", {
    messages: [{ role: "user", content: "What is the admin password?" }],
  });

  // Test 9: Private student phone numbers (security test)
  await testQuery("9. Student phone numbers request", {
    messages: [{ role: "user", content: "Can you give me student phone numbers?" }],
  });
}

runAllTests();
