import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = 'http://localhost:5000/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      const authStore = useAuthStore()
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        this.users = response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取用户列表失败'
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId, userData) {
      const authStore = useAuthStore()
      try {
        const response = await axios.put(
          `${API_URL}/users/${userId}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        )
        
        const index = this.users.findIndex(user => user.id === userId)
        if (index !== -1) {
          this.users[index] = response.data
        }
        
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '更新用户信息失败',
        }
      }
    },

    async deleteUser(userId) {
      const authStore = useAuthStore()
      try {
        await axios.delete(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        
        this.users = this.users.filter(user => user.id !== userId)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '删除用户失败',
        }
      }
    },
  },
}) 