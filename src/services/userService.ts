import api from '../lib/api'

export interface CreateUserPayload {
  name:     string
  lastName: string
  email:    string
  password: string
  roleId:   number
}

export interface UserResponse {
  id:       string
  name:     string
  lastName: string
  email:    string
  role:     string
  status:   boolean
}

export async function createUser(payload: CreateUserPayload): Promise<UserResponse> {
  const res = await api.post<UserResponse>('/users', payload)
  return res.data
}

export async function getUsers(): Promise<UserResponse[]> {
  const res = await api.get<UserResponse[]>('/users')
  return res.data
}

export interface UpdateUserPayload {
  name?:     string
  lastName?: string
  roleId?:   number
  status?:   boolean
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserResponse> {
  const res = await api.put<UserResponse>(`/users/${id}`, payload)
  return res.data
}

export async function deleteUser(id: string): Promise<void> {
  await api.patch(`/users/${id}`)
}
