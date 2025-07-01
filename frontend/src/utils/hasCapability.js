

export function hasAllCapabilities(user, requiredCapabilities = []) {
  if (!user || !user.capabilities || !Array.isArray(requiredCapabilities)) return false;
  return requiredCapabilities.every(cap => user.capabilities.includes(cap));
}



export function hasAnyCapability(user, requiredCapabilities = []) {
  if (!user || !user.capabilities || !Array.isArray(requiredCapabilities)) return false;
  return requiredCapabilities.some(cap => user.capabilities.includes(cap));
}
