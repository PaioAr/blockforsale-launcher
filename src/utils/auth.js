const { ipcRenderer } = window.require('electron')

export async function loginMicrosoft() {
  const result = await ipcRenderer.invoke('microsoft-login')
  return result
}

export function saveProfile(profile) {
  localStorage.setItem('bfs_profile', JSON.stringify(profile))
}

export function loadProfile() {
  const data = localStorage.getItem('bfs_profile')
  return data ? JSON.parse(data) : null
}

export function logout() {
  localStorage.removeItem('bfs_profile')
}