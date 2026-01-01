import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get the user's JWT from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a client with the user's token to verify they're an admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is an admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, targetUserId, newPassword, newName, newRole } = await req.json();

    switch (action) {
      case "list": {
        // Get all users from auth.users via admin API
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        // Get profiles and roles
        const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
        const { data: roles } = await supabaseAdmin.from("user_roles").select("*");

        const users = authUsers.users.map((authUser) => {
          const profile = profiles?.find((p) => p.id === authUser.id);
          const userRole = roles?.find((r) => r.user_id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || "",
            role: userRole?.role || "user",
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
          };
        });

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_password": {
        if (!targetUserId || !newPassword) {
          return new Response(JSON.stringify({ error: "Missing targetUserId or newPassword" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          { password: newPassword }
        );

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_name": {
        if (!targetUserId || !newName) {
          return new Response(JSON.stringify({ error: "Missing targetUserId or newName" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ full_name: newName })
          .eq("id", targetUserId);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_role": {
        if (!targetUserId || !newRole) {
          return new Response(JSON.stringify({ error: "Missing targetUserId or newRole" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent self-demotion
        if (targetUserId === user.id && newRole !== "admin") {
          return new Response(JSON.stringify({ error: "Cannot demote your own account" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user already has a role entry
        const { data: existingRole } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", targetUserId)
          .single();

        if (existingRole) {
          const { error: updateError } = await supabaseAdmin
            .from("user_roles")
            .update({ role: newRole })
            .eq("user_id", targetUserId);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: targetUserId, role: newRole });
          if (insertError) throw insertError;
        }

        console.log(`Role updated for user ${targetUserId} to ${newRole}`);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        if (!targetUserId) {
          return new Response(JSON.stringify({ error: "Missing targetUserId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent self-deletion
        if (targetUserId === user.id) {
          return new Response(JSON.stringify({ error: "Cannot delete your own account" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: any) {
    console.error("Admin manage users error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
