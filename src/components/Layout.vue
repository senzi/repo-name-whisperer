<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- 输入卡片 -->
    <n-card class="bg-gray-800">
      <n-space vertical :size="24">
        <n-h2>仓库名称生成器</n-h2>
        <n-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="项目描述" path="description" required>
            <n-input
              v-model:value="formValue.description"
              type="textarea"
              :rows="3"
              placeholder="描述你的项目是做什么的？"
              :maxlength="200"
              show-count
            />
          </n-form-item>
          <n-form-item label="技术栈" path="techStack">
            <n-input
              v-model:value="formValue.techStack"
              type="text"
              placeholder="例如：Vue, React, Node.js"
              :maxlength="50"
              show-count
            />
          </n-form-item>
          <n-form-item label="必须包含的单词" path="mustInclude">
            <n-input
              v-model:value="formValue.mustInclude"
              type="text"
              placeholder="(可选) 例如: Awsome"
              :maxlength="20"
              show-count
            />
          </n-form-item>
        </n-form>
        <n-button
          type="primary"
          block
          strong
          :loading="loading"
          :disabled="!formValue.description || loading"
          @click="handleSubmit"
        >
          {{ loading ? '生成中...' : '生成名称' }}
        </n-button>
      </n-space>
    </n-card>

    <!-- 结果卡片 -->
    <n-card class="bg-gray-800">
      <template #header>
        <n-text>生成结果</n-text>
      </template>
      <div v-if="result" class="space-y-4">
        <n-card class="bg-gray-700" embedded>
          <template #header-extra>
            <n-button
              quaternary
              circle
              size="small"
              @click="copyToClipboard(result.name)"
            >
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </template>
          <template #header>
            <n-text class="text-gray-300">仓库名称</n-text>
          </template>
          <n-text class="font-mono">{{ result.name }}</n-text>
        </n-card>
        <n-card class="bg-gray-700" embedded>
          <template #header-extra>
            <n-button
              quaternary
              circle
              size="small"
              @click="copyToClipboard(result.description)"
            >
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </template>
          <template #header>
            <n-text class="text-gray-300">描述</n-text>
          </template>
          <n-text>{{ result.description }}</n-text>
        </n-card>
      </div>
      <template v-else>
        <div class="py-8 text-center">
          <n-text depth="3">生成的「Repository name」和「Description」将显示在这里</n-text>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const loading = ref(false)
const result = ref(null)

const formValue = ref({
  description: '',
  techStack: '',
  mustInclude: ''
})

const rules = {
  description: {
    required: true,
    message: '请输入项目描述',
    trigger: ['blur', 'input']
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 秒超时

    const response = await fetch('/api/generate-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formValue.value),
      signal: controller.signal
    })
    
    clearTimeout(timeout);
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || '生成失败')
    }
    
    result.value = data.data
    message.success('生成成功')
  } catch (error) {
    if (error.name === 'AbortError') {
      message.error('请求超时，请重试')
    } else {
      message.error(error.message || '生成失败，请重试')
    }
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('复制成功')
  } catch (err) {
    message.error('复制失败')
    console.error('Copy Error:', err)
  }
}
</script>

<style>
.n-card {
  transition: all 0.3s ease;
}

.n-button {
  transition: all 0.2s ease;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.max-w-2xl {
  max-width: 42rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.text-center {
  text-align: center;
}

.bg-gray-800 {
  background-color: #1f2937;
}

.bg-gray-700 {
  background-color: #374151;
}

.text-gray-300 {
  color: #d1d5db;
}
</style>
