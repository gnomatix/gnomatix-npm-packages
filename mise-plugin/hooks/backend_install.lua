local cmd = require("cmd")
local file = require("file")

-- Logic to install a specific @gnomatix package version via npm
function install(ctx)
  local tool = ctx.tool:gsub("^gnomatix:", "")
  local package_name = "@gnomatix/" .. tool
  local registry_url = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"

  -- Use npm to install the package directly into the mise-managed path
  -- We use --prefix to control exactly where the node_modules land
  local install_cmd = string.format("npm install %s@%s --prefix %s --registry %s --no-save", 
                                    package_name, ctx.version, ctx.install_path, registry_url)
  
  local res = cmd.run(install_cmd)
  if res.status ~= 0 then
    error("Failed to install package " .. package_name .. "@" .. ctx.version)
  end

  -- Structure cleanup: Move the package contents out of node_modules/@gnomatix/pkg
  -- and into the root of ctx.install_path for clean discovery.
  local source_path = file.join(ctx.install_path, "node_modules", "@gnomatix", tool)
  
  -- Logic to move files (simplified for Lua)
  -- In production, we'd iterate and copy or use a shell move command
  if RUNTIME.osType == "windows" then
    cmd.run(string.format("powershell -Command "Copy-Item -Path %s\* -Destination %s -Recurse -Force"", 
                          source_path, ctx.install_path))
  else
    cmd.run(string.format("cp -r %s/* %s/", source_path, ctx.install_path))
  end

  -- Clean up node_modules
  file.remove_all(file.join(ctx.install_path, "node_modules"))
end
