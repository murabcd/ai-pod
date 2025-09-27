import { readFileSync } from "node:fs";
import { join } from "node:path";
import { serve } from "bun";

const envFile = join(process.cwd(), ".env");
try {
  const envContent = readFileSync(envFile, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  }
} catch (error) {
  console.warn("No .env file found or error reading it:", error);
}

const server = serve({
  port: 3001,
  async fetch(request: Request) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Route to API handlers
    if (url.pathname === "/api/podcast" && request.method === "POST") {
      try {
        const { POST } = await import("./api/podcast.ts");
        return await POST(request);
      } catch (error) {
        console.error("Error in podcast endpoint:", error);
        return new Response(
          JSON.stringify({ error: "Internal server error" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
