print("DEBUG: Gnomatix BackendListVersions hook loaded")
function PLUGIN:BackendListVersions(ctx)
    local cmd = require("cmd")
    local json = require("json")

    -- Remove gnomatix: prefix if present
    local tool = ctx.tool:gsub("^gnomatix:", "")
    -- Prepend @gnomatix/ scope if not present
    local package_name = tool
    if not tool:find("^@") then
        package_name = "@gnomatix/" .. tool
    end

    local registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    local npm_cmd = "npm view " .. package_name .. " versions --json --registry " .. registry
    
    local result = cmd.exec(npm_cmd)
    if result.exit_code ~= 0 then
        return {versions = {}}
    end

    local versions = json.decode(result.stdout)
    -- Handle case where only one version is returned (string instead of table)
    if type(versions) == "string" then
        versions = {versions}
    end

    return {versions = versions}
end