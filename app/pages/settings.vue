<template>
  <div class="p-4 space-y-4">
    <h1 class="text-xl font-bold">Settings</h1>
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span>Unit</span>
        <select v-model="unit" class="bg-gray-800 p-2 rounded">
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>
      <div>
        <button class="px-4 py-2 bg-gray-800 rounded" @click="exportJson">Export JSON</button>
        <input type="file" @change="importJson" class="ml-3" />
      </div>
      <p class="text-sm opacity-70">Role: {{ role || 'unknown' }} | Coach permission: {{ coachPermission || '-' }}</p>
      <div>
        <button class="px-4 py-2 bg-red-600 rounded" @click="logout()">Logout</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { db } from '../db/indexed'
import { useHead, useState } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
const unit = useState<'kg'|'lb'>('unit', ()=>'kg')
const { logout, role, coachPermission } = useAuth()

async function exportJson(){
  const data = {
    exercises: await db.exercises.toArray(),
    sessions: await db.sessions.toArray(),
    sets: await db.sets.toArray(),
  }
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'jthemonster-export.json'; a.click()
  URL.revokeObjectURL(url)
}
async function importJson(ev: Event){
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  const txt = await file.text()
  const data = JSON.parse(txt)
  await db.transaction('rw', db.exercises, db.sessions, db.sets, async () => {
    await db.exercises.clear(); await db.sessions.clear(); await db.sets.clear()
    await db.exercises.bulkPut(data.exercises||[])
    await db.sessions.bulkPut(data.sessions||[])
    await db.sets.bulkPut(data.sets||[])
  })
}
useHead({ title: 'Settings • J The Monster' })
</script>
