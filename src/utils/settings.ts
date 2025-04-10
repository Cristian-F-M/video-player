export function getSettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  return settings
}

export function saveSettings(key: string, value: string) {
  const settings = getSettings()
  settings[key] = value
  localStorage.setItem('settings', JSON.stringify(settings))
}


export function removeSettings(key: string) {
  const settings = getSettings()
  delete settings[key]
  localStorage.setItem('settings', JSON.stringify(settings))
}

export function clearSettings() {
  localStorage.removeItem('settings')
}