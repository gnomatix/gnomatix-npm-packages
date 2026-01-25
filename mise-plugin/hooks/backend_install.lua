function PLUGIN:BackendInstall(ctx)
    local cmd = require("cmd")
    local file = require("file")

    local tool = ctx.tool:gsub("^gnomatix:", "")
    local package_name = tool
    if not tool:find("^@") then
        package_name = "@gnomatix/" .. tool
    end

    local registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    
    -- mise provides ctx.install_path as an atomic, temporary location.
    -- We install the package here. Since it's a temp dir, we don't have to worry 
    -- about concurrent installs or cleaning up half-finished work.
    local npm_cmd = string.format(
        "npm install %s@%s --prefix %q --registry %s --no-save --no-package-lock --silent",
        package_name, ctx.version, ctx.install_path, registry
    )
    
    local result = cmd.exec(npm_cmd)
    if result.exit_code ~= 0 then
        error("Failed to install " .. package_name .. "@" .. ctx.version .. "\n" .. result.stderr)
    end

    -- Structure cleanup: The content is currently in ctx.install_path/node_modules/@gnomatix/pkg
    -- We want the content at the root of the install_path.
    local base_name = package_name:gsub("^@gnomatix/", "")
    local source = file.join(ctx.install_path, "node_modules", "@gnomatix", base_name)
    
    -- Using native move logic which is safe inside mise's temp install_path
    if RUNTIME.osType == "windows" then
        cmd.exec(string.format("powershell -Command \"Move-Item -Path %q\\* -Destination %q -Force\"", source, ctx.install_path))
    else
        cmd.exec(string.format("mv %s/* %s/", source, ctx.install_path))
    end

    -- We can safely delete node_modules here as we are inside mise's atomic temp dir
    file.remove_all(file.join(ctx.install_path, "node_modules"))

    return {}
end
