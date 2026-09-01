import { createClient } from "npm:@supabase/supabase-js@^2";
import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const TARGET_TABLE = "All_Tasks";

const TASK_ID_COLUMN = "TASK_ID";

const CREATED_AT_COLUMN = "CREATED_AT";

const LAST_MODIFIED_AT_COLUMN = "LAST_MODIFIED_AT";

const WHITELISTED_IPS = [
  "41.236.24.86",
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
    |
    | MUST happen before the IP check.
    |
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
          success: false,
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

    const clientIP = getClientIP(req);

    if (!clientIP) {

      return jsonResponse(
        {
          success: false,
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
          success: false,
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
          success: false,
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
          success: false,
          error:
            "Request body must be a JSON object containing key-value pairs.",
        },
        400,
      );
    }


    const data =
      payload as Record<string, unknown>;


    /*
    |--------------------------------------------------------------------------
    | 7. DATA CANNOT BE EMPTY
    |--------------------------------------------------------------------------
    */

    if (Object.keys(data).length === 0) {

      return jsonResponse(
        {
          success: false,
          error: "No data was provided.",
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 8. SUPABASE ENVIRONMENT VARIABLES
    |--------------------------------------------------------------------------
    */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");


    if (!supabaseUrl || !serviceRoleKey) {

      console.error(
        "Supabase environment variables are missing.",
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Server configuration error.",
        },
        500,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 9. CREATE SUPABASE CLIENT
    |--------------------------------------------------------------------------
    */

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
      );


    /*
    |--------------------------------------------------------------------------
    | 10. CHECK TASK_ID
    |--------------------------------------------------------------------------
    */

    const hasTaskId =
      Object.prototype.hasOwnProperty.call(
        data,
        TASK_ID_COLUMN,
      );


    /*
    |--------------------------------------------------------------------------
    | 11. CHECK DELETE OPERATION
    |--------------------------------------------------------------------------
    */

    const isDeleteOperation =
      data["OP_CODE"] === "delete";


    /*
    |--------------------------------------------------------------------------
    | 12. DELETE
    |--------------------------------------------------------------------------
    */

    if (isDeleteOperation) {

      if (!hasTaskId) {

        return jsonResponse(
          {
            success: false,
            error:
              'OP_CODE is "delete", but TASK_ID was not provided.',
          },
          400,
        );
      }


      const taskId =
        data[TASK_ID_COLUMN];


      if (
        taskId === null ||
        taskId === undefined ||
        taskId === ""
      ) {

        return jsonResponse(
          {
            success: false,
            error:
              'OP_CODE is "delete", but TASK_ID is empty.',
          },
          400,
        );
      }


      /*
      |--------------------------------------------------------------------------
      | FIND TASK
      |--------------------------------------------------------------------------
      */

      const {
        data: existingTask,
        error: lookupError,
      } = await supabase
        .from(TARGET_TABLE)
        .select(TASK_ID_COLUMN)
        .eq(TASK_ID_COLUMN, taskId)
        .maybeSingle();


      if (lookupError) {

        console.error(
          "TASK_ID lookup error:",
          lookupError,
        );

        return jsonResponse(
          {
            success: false,
            error: lookupError.message,
            code: lookupError.code,
          },
          400,
        );
      }


      /*
      |--------------------------------------------------------------------------
      | TASK DOES NOT EXIST
      |--------------------------------------------------------------------------
      */

      if (!existingTask) {

        return jsonResponse(
          {
            success: false,
            operation: "DELETE",
            message:
              "TASK_ID does not exist. Nothing was deleted.",
            TASK_ID: taskId,
          },
          404,
        );
      }


      /*
      |--------------------------------------------------------------------------
      | DELETE TASK
      |--------------------------------------------------------------------------
      */

      const {
        data: deletedData,
        error: deleteError,
      } = await supabase
        .from(TARGET_TABLE)
        .delete()
        .eq(TASK_ID_COLUMN, taskId)
        .select()
        .single();


      if (deleteError) {

        console.error(
          "Delete error:",
          deleteError,
        );

        return jsonResponse(
          {
            success: false,
            error: deleteError.message,
            code: deleteError.code,
          },
          400,
        );
      }


      return jsonResponse(
        {
          success: true,
          operation: "DELETE",
          message:
            "Row deleted successfully.",
          TASK_ID: taskId,
          data: deletedData,
        },
        200,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 13. NO TASK_ID → CREATE NEW ROW
    |--------------------------------------------------------------------------
    */

    if (!hasTaskId) {

      const now =
        new Date().toISOString();


      const insertData:
        Record<string, unknown> = {
          ...data,
        };


      /*
      * OP_CODE is never stored.
      */
      delete insertData["OP_CODE"];


      /*
      * Client cannot control CREATED_AT.
      */
      delete insertData[
        CREATED_AT_COLUMN
      ];


      /*
      * Client cannot control LAST_MODIFIED_AT.
      */
      delete insertData[
        LAST_MODIFIED_AT_COLUMN
      ];


      /*
      * Server-controlled timestamps.
      */
      insertData[
        CREATED_AT_COLUMN
      ] = now;

      insertData[
        LAST_MODIFIED_AT_COLUMN
      ] = now;


      /*
      |--------------------------------------------------------------------------
      | INSERT
      |--------------------------------------------------------------------------
      */

      const {
        data: insertedData,
        error: insertError,
      } = await supabase
        .from(TARGET_TABLE)
        .insert(insertData)
        .select()
        .single();


      if (insertError) {

        console.error(
          "Insert error:",
          insertError,
        );

        return jsonResponse(
          {
            success: false,
            error: insertError.message,
            code: insertError.code,
          },
          400,
        );
      }


      return jsonResponse(
        {
          success: true,
          operation: "INSERT",
          message:
            "New row created successfully.",
          data: insertedData,
        },
        201,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 14. TASK_ID WAS PROVIDED
    |--------------------------------------------------------------------------
    */

    const taskId =
      data[TASK_ID_COLUMN];


    if (
      taskId === null ||
      taskId === undefined ||
      taskId === ""
    ) {

      return jsonResponse(
        {
          success: false,
          error:
            "TASK_ID cannot be null or empty.",
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 15. CHECK WHETHER TASK_ID EXISTS
    |--------------------------------------------------------------------------
    */

    const {
      data: existingTask,
      error: lookupError,
    } = await supabase
      .from(TARGET_TABLE)
      .select(TASK_ID_COLUMN)
      .eq(TASK_ID_COLUMN, taskId)
      .maybeSingle();


    if (lookupError) {

      console.error(
        "TASK_ID lookup error:",
        lookupError,
      );

      return jsonResponse(
        {
          success: false,
          error: lookupError.message,
          code: lookupError.code,
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 16. TASK_ID EXISTS → UPDATE
    |--------------------------------------------------------------------------
    */

    if (existingTask) {

      const updateData:
        Record<string, unknown> = {
          ...data,
        };


      /*
      * Protected fields.
      */

      delete updateData[
        TASK_ID_COLUMN
      ];

      delete updateData[
        CREATED_AT_COLUMN
      ];

      delete updateData[
        LAST_MODIFIED_AT_COLUMN
      ];

      delete updateData[
        "OP_CODE"
      ];


      /*
      |--------------------------------------------------------------------------
      | NOTHING TO CHANGE
      |--------------------------------------------------------------------------
      */

      if (
        Object.keys(updateData).length === 0
      ) {

        return jsonResponse(
          {
            success: true,
            operation: "NO_CHANGE",
            message:
              "No mutable values were supplied.",
            TASK_ID: taskId,
          },
          200,
        );
      }


      /*
      |--------------------------------------------------------------------------
      | AUTOMATIC LAST_MODIFIED_AT
      |--------------------------------------------------------------------------
      */

      updateData[
        LAST_MODIFIED_AT_COLUMN
      ] = new Date().toISOString();


      /*
      |--------------------------------------------------------------------------
      | UPDATE ONLY SUPPLIED VALUES
      |--------------------------------------------------------------------------
      */

      const {
        data: updatedData,
        error: updateError,
      } = await supabase
        .from(TARGET_TABLE)
        .update(updateData)
        .eq(TASK_ID_COLUMN, taskId)
        .select()
        .single();


      if (updateError) {

        console.error(
          "Update error:",
          updateError,
        );

        return jsonResponse(
          {
            success: false,
            error:
              updateError.message,
            code:
              updateError.code,
          },
          400,
        );
      }


      return jsonResponse(
        {
          success: true,
          operation: "UPDATE",
          message:
            "Existing row updated. Only supplied values were changed.",
          TASK_ID: taskId,
          data: updatedData,
        },
        200,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 17. TASK_ID DOES NOT EXIST → CREATE NEW ROW
    |--------------------------------------------------------------------------
    */

    const now =
      new Date().toISOString();


    const insertData:
      Record<string, unknown> = {
        ...data,
      };


    /*
    * OP_CODE is not database data.
    */
    delete insertData[
      "OP_CODE"
    ];


    /*
    * Client cannot control timestamps.
    */
    delete insertData[
      CREATED_AT_COLUMN
    ];

    delete insertData[
      LAST_MODIFIED_AT_COLUMN
    ];


    /*
    * Server controls timestamps.
    */
    insertData[
      CREATED_AT_COLUMN
    ] = now;

    insertData[
      LAST_MODIFIED_AT_COLUMN
    ] = now;


    /*
    |--------------------------------------------------------------------------
    | INSERT NEW ROW
    |--------------------------------------------------------------------------
    */

    const {
      data: insertedData,
      error: insertError,
    } = await supabase
      .from(TARGET_TABLE)
      .insert(insertData)
      .select()
      .single();


    if (insertError) {

      console.error(
        "Insert error:",
        insertError,
      );

      return jsonResponse(
        {
          success: false,
          error:
            insertError.message,
          code:
            insertError.code,
        },
        400,
      );
    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return jsonResponse(
      {
        success: true,
        operation: "INSERT",
        message:
          "TASK_ID did not exist, so a new row was created.",
        TASK_ID: taskId,
        data: insertedData,
      },
      201,
    );

  } catch (error) {

    console.error(
      "Unexpected Edge Function error:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Internal server error.",
      },
      500,
    );
  }
});
