// ~/composables/useExercises.ts
import { ref } from 'vue'
import { useRepo } from '~/composables/useRepo'

export type ExerciseItem = { id: string; name: string }

export function useExercises() {
  const list = ref<ExerciseItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const repo = useRepo()

  const load = async () => {
    loading.value = true
    try {
      list.value = await repo.allExercises()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return { list, loading, error, load }
}
