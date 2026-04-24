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
