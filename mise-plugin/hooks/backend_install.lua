function PLUGIN:BackendInstall(ctx)
    local cmd = require("cmd")
    local file = require("file")

    local tool = ctx.tool:gsub("^gnomatix:", "")
    local package_name = tool
    if not tool:find("^@") then
        package_name = "@gnomatix/" .. tool
    end

    local registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    local install_path = ctx.install_path

    -- Install using npm into the mise install path
    -- We use --prefix to ensure it lands exactly in the install_path/node_modules
    local npm_cmd = "npm install " .. package_name .. "@" .. ctx.version .. " --prefix " .. install_path .. " --registry " .. registry .. " --no-save --no-package-lock --silent"
    
    local result = cmd.exec(npm_cmd)
    if result.exit_code ~= 0 then
        error("Failed to install " .. package_name .. "@" .. ctx.version .. "\n" .. result.stderr)
    end

    -- Move contents to the root of the install path for easier discovery by the agent
    local base_name = package_name:gsub("^@gnomatix/", "")
    local source = file.join(install_path, "node_modules", "@gnomatix", base_name)
    
    if RUNTIME.osType == "windows" then
        cmd.exec("powershell -Command \"Copy-Item -Path '" .. source .. "\\*' -Destination '" .. install_path .. "' -Recurse -Force\"")
    else
        cmd.exec("cp -r " .. source .. "/* " .. install_path .. "/")
    end

    -- Cleanup node_modules
    file.remove_all(file.join(install_path, "node_modules"))

    return {}
end