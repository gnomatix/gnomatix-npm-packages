function PLUGIN:BackendExecEnv(ctx)
    local tool = ctx.tool:gsub("^gnomatix:", "")
    local install_path = ctx.install_path
    
    -- Determine the type of package (rule, skill, workflow, role)
    local env_vars = {}
    
    if tool:find("^rule-") then
        env_vars["GNOMATIX_RULES_PATH"] = install_path
    elseif tool:find("^skill-") then
        env_vars["GNOMATIX_SKILLS_PATH"] = install_path
    elseif tool:find("^workflow-") then
        env_vars["GNOMATIX_WORKFLOWS_PATH"] = install_path
    elseif tool:find("^role-") then
        -- For a role, we set the root and let the role's own mise.toml handle sub-paths
        env_vars["GNOMATIX_ROLE_PATH"] = install_path
    end

    return {env = env_vars}
end