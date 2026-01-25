-- Logic to set environment variables when a gnomatix tool is active
function exec_env(ctx)
  local tool = ctx.tool:gsub("^gnomatix:", "")
  local type = tool:split("-")[1] .. "s" -- e.g. rule -> rules
  
  -- Dynamically set the path for the specific tool type
  local env_var = "GNOMATIX_" .. type:upper() .. "_PATH"
  
  return {
    [env_var] = ctx.install_path
  }
end
