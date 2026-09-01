import { createClient } from "npm:@supabase/supabase-js@^2";
import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const TARGET_TABLE = "All_Tasks";

const WHITELISTED_IPS = [
  "41.236.24.86",
  // Add more allowed IP addresses here if needed.
];


/*
|--------------------------------------------------------------------------
| JSON RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}


/*
|--------------------------------------------------------------------------
| GET CLIENT IP
|--------------------------------------------------------------------------
*/

function getClientIP(req: Request): string | null {

  const cfConnectingIp =
    req.headers.get("cf-connecting-ip");

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const forwardedFor =
    req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIP =
      forwardedFor.split(",")[0]?.trim();

    if (firstIP) {
      return firstIP;
    }
  }

  const realIP =
    req.headers.get("x-real-ip");

  if (realIP) {
    return realIP.trim();
  }

  return null;
}


/*
|--------------------------------------------------------------------------
| EDGE FUNCTION
|--------------------------------------------------------------------------
*/

Deno.serve(async (req: Request) => {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. CORS PREFLIGHT
    |--------------------------------------------------------------------------
    */

    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: corsHeaders,
      });
    }


    /*
    |--------------------------------------------------------------------------
    | 2. ONLY ALLOW POST
    |--------------------------------------------------------------------------
    */

    if (req.method !== "POST") {
      return jsonResponse(
        {
          error: "Only POST requests are allowed.",
        },
        405,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 3. GET CLIENT IP
    |--------------------------------------------------------------------------
    */

    const clientIP =
      getClientIP(req);

    if (!clientIP) {
      return jsonResponse(
        {
          error:
            "Unable to determine client IP address.",
        },
        403,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 4. CHECK IP WHITELIST
    |--------------------------------------------------------------------------
    */

    if (!WHITELISTED_IPS.includes(clientIP)) {

      console.warn(
        `Blocked request from IP: ${clientIP}`,
      );

      return jsonResponse(
        {
          error:
            "IP address is not authorized.",
        },
        403,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 5. READ REQUEST BODY
    |--------------------------------------------------------------------------
    */

    let payload: unknown;

    try {
      payload = await req.json();
    } catch {
      return jsonResponse(
        {
          error:
            "Request body must contain valid JSON.",
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 6. REQUEST BODY MUST BE AN OBJECT
    |--------------------------------------------------------------------------
    */

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return jsonResponse(
        {
          error:
            "Request body must be a JSON object.",
        },
        400,
      );
    }


    const data =
      payload as Record<string, unknown>;


    /*
    |--------------------------------------------------------------------------
    | 7. COUNT MUST BE PROVIDED
    |--------------------------------------------------------------------------
    */

    if (
      !Object.prototype.hasOwnProperty.call(
        data,
        "count",
      )
    ) {
      return jsonResponse(
        {
          error:
            'The "count" argument is required.',
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 8. VALIDATE COUNT
    |--------------------------------------------------------------------------
    */

    const count =
      data["count"];

    if (
      typeof count !== "number" ||
      !Number.isInteger(count) ||
      count <= 0
    ) {
      return jsonResponse(
        {
          error:
            '"count" must be a positive integer.',
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 9. CREATE SUPABASE CLIENT
    |--------------------------------------------------------------------------
    */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      );

    if (!supabaseUrl || !serviceRoleKey) {

      console.error(
        "Supabase environment variables are missing.",
      );

      return jsonResponse(
        {
          error:
            "Server configuration error.",
        },
        500,
      );
    }


    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
      );


    /*
    |--------------------------------------------------------------------------
    | 10. GET MOST RECENT ROWS FIRST
    |--------------------------------------------------------------------------
    |
    | CREATED_AT DESC:
    |
    | newest row
    |      ↓
    | older row
    |      ↓
    | oldest row
    |
    */

    const {
      data: rows,
      error,
    } = await supabase
      .from(TARGET_TABLE)
      .select("*")
      .order("CREATED_AT", {
        ascending: false,
      })
      .limit(count);


    /*
    |--------------------------------------------------------------------------
    | 11. DATABASE ERROR
    |--------------------------------------------------------------------------
    */

    if (error) {

      console.error(
        "Supabase query error:",
        error,
      );

      return jsonResponse(
        {
          error:
            error.message,
          code:
            error.code,
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 12. RETURN ONLY THE ARRAY
    |--------------------------------------------------------------------------
    */

    return jsonResponse(
      rows ?? [],
      200,
    );

  } catch (error) {

    console.error(
      "Unexpected Edge Function error:",
      error,
    );

    return jsonResponse(
      {
        error:
          "Internal server error.",
      },
      500,
    );
  }
});
