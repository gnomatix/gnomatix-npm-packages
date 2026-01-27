function PLUGIN:Available(ctx)
    -- This hook tells mise which tools this backend provides.
    -- For now, we list our main bundles and roles.
    return {
        tools = {
            "bundle-dipshit",
            "role-agent-default"
        }
    }
end
