function PLUGIN:BackendInstall(ctx)
    local cmd = require("cmd")
    local file = require("file")

    local tool = ctx.tool:gsub("^gnomatix:", "")
    local package_name = tool
    if not tool:find("^@") then
        package_name = "@gnomatix/" .. tool
    end

    local registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    
    -- 1. Install to mise managed storage (Internal)
    print("Installing " .. package_name .. "@" .. ctx.version .. " to mise storage...")
    local npm_cmd = string.format(
        "npm install %s@%s --prefix %q --registry %s --no-save --no-package-lock --silent",
        package_name, ctx.version, ctx.install_path, registry
    )
    
    local result = cmd.exec(npm_cmd)
    if result.exit_code ~= 0 then
        error("Failed to install " .. package_name .. "@" .. ctx.version .. "\n" .. result.stderr)
    end

    -- Cleanup mise storage structure
    local base_name = package_name:gsub("^@gnomatix/", "")
    local source = file.join(ctx.install_path, "node_modules", "@gnomatix", base_name)

    if RUNTIME.osType == "windows" then
        cmd.exec(string.format("powershell -Command \"Move-Item -Path %q\\* -Destination %q -Force\"", source, ctx.install_path))
    else
        cmd.exec(string.format("mv %s/* %s/", source, ctx.install_path))
    end
    file.remove_all(file.join(ctx.install_path, "node_modules"))

    -- 2. Materialize to local Workspace .agent directory (Deployment)
    -- We determine the repo root via git to satisfy the "no relative paths" and "relying on git" requirements.
    local root_res = cmd.exec("git rev-parse --show-toplevel")
    if root_res.exit_code == 0 then
        local repo_root = root_res.stdout:gsub("[\r\n]", "")
        local agent_dir = file.join(repo_root, ".agent")
        
        print("Materializing " .. tool .. " to " .. agent_dir .. "...")
        
        -- We need to read the dependencies of the bundle to pack them.
        -- BUT: mise handles dependencies if we use 'mise use' for the atoms too.
        -- HOWEVER: The user wants to install the BUNDLE and have it populate the environment.
        
        -- Logic from deploy-role.js refactored to Lua/Shell:
        -- If this is a bundle, it has a package.json with dependencies.
        local pkg_json_path = file.join(ctx.install_path, "package.json")
        -- We'll use a shell one-liner to parse dependencies and pack them into the agent dir.
        -- To keep it robust, we'll use a node script bundled with the plugin for the heavy lifting.
        
        local helper_script = file.join(repo_root, "scripts", "materialize-agent.js")
        -- Wait, the user said delete the local deployment script.
        -- I should put the helper script INSIDE the plugin directory so it's part of the tool.
        
        local plugin_helper = file.join(RUNTIME.pluginDir, "scripts", "materialize.js")
        -- I will create this file in the next step.
        
        local deploy_cmd = string.format("node %q %q %q", plugin_helper, ctx.install_path, agent_dir)
        local deploy_res = cmd.exec(deploy_cmd)
        if deploy_res.exit_code ~= 0 then
            print("Warning: Materialization failed: " .. deploy_res.stderr)
        else
            print(deploy_res.stdout)
        end
    end

    return {}
end
