local http = require("http")
local json = require("json")

-- Logic to list versions of a @gnomatix/* package from Gitea
function list_versions(ctx)
  local tool = ctx.tool:gsub("^gnomatix:", "")
  local package_name = "@gnomatix/" .. tool
  local registry_url = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
  local package_url = registry_url .. package_name:gsub("/", "%%2f")

  local res = http.get(package_url)
  if res.status ~= 200 then
    return {}
  end

  local metadata = json.decode(res.body)
  local versions = {}
  for version, _ in pairs(metadata.versions) do
    table.insert(versions, version)
  end

  return versions
end
