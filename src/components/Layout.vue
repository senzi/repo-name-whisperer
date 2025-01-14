<template>
  <div class="max-w-xl mx-auto px-4 py-8 space-y-8">
    <!-- 输入卡片 -->
    <n-card class="bg-gray-800">
      <n-space vertical :size="24">
        <div class="space-y-2 text-center">
          <div>
            <n-h2 class="text-2xl font-bold mb-1">Repo Whisperer</n-h2>
            <n-tag bordered :color="{ borderColor: '#4f6bfe', textColor: '#4f6bfe' }">
              Powered by DeepSeek
            </n-tag>
          </div>
          <n-text depth="3" class="text-sm">
            由 DeepSeek-V3 驱动的智能仓库命名助手
          </n-text>
        </div>
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
          {{ loading ? '生成中...' : '生成仓库名' }}
        </n-button>
      </n-space>
    </n-card>

    <!-- 结果卡片 -->
    <n-card class="result-card">
      <div class="space-y-6">
        <!-- 引导文案 -->
        <div class="text-center space-y-2">
          <div class="space-y-1">
            <n-text class="text-lg font-medium block">
              千行代码 始于好名字w
            </n-text>
          </div>
          <n-text depth="3" class="text-sm block">
            让我们帮你找到 项目的完美起点
          </n-text>
        </div>

        <!-- 结果展示区 -->
        <template v-if="result">
          <div class="space-y-4">
            <n-card class="bg-gray-700" embedded>
              <template #header-extra>
                <n-button
                  quaternary
                  circle
                  size="small"
                  @click="copyToClipboard(result.name)"
                >
                  <template #icon>
                    <n-icon><CopyIcon /></n-icon>
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
                    <n-icon><CopyIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              <template #header>
                <n-text class="text-gray-300">描述</n-text>
              </template>
              <n-text>{{ result.description }}</n-text>
            </n-card>
          </div>
          
          <!-- 行动引导 -->
          <div class="text-center mt-4">
            <n-button
              type="primary"
              secondary
              @click="goToGithub"
            >
              <template #icon>
                <n-icon><GithubIcon /></n-icon>
              </template>
              立即创建仓库
            </n-button>
          </div>
        </template>

        <!-- 优化的占位效果 -->
        <template v-else>
          <div class="space-y-4 opacity-70">
            <n-skeleton :height="60" />
            <n-skeleton :height="100" />
          </div>
        </template>

        <!-- 分割线和底部信息 -->
        <n-divider />
        <div class="space-y-2 text-center text-sm">
          <n-p class="whitespace-pre-line">
            内容由 DeepSeek-V3 提供
            <span v-if="showDot" class="text-gray-500">·</span>
            <n-a href="https://github.com/senzi/repo-name-whisperer" target="_blank">
              MIT License
            </n-a>
          </n-p>
          <n-p class="whitespace-pre-line">
            在 
            <n-a href="https://repo.closeai.moe" target="_blank">
              repo.closeai.moe
            </n-a>
            生成你自己的仓库名
          </n-p>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NSpace, NCard, NH2, NText, NForm, NFormItem,
  NInput, NButton, NIcon, NSkeleton, NDivider,
  NTag, NP, NA
} from 'naive-ui'
import CopyIcon from './icons/CopyIcon.vue'
import GithubIcon from './icons/GithubIcon.vue'

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

// 计算是否显示点号
const showDot = computed(() => {
  return window.innerWidth > 640
})

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

const goToGithub = () => {
  if (result.value) {
    const url = `https://github.com/new?name=${encodeURIComponent(result.value.name)}&description=${encodeURIComponent(result.value.description)}`;
    window.open(url, '_blank');
  }
}
</script>

<style>
.n-card {
  transition: all 0.3s ease;
  border-radius: 16px !important;
}

.n-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.result-card {
  background: linear-gradient(145deg, #1f2937, #1a202c);
}

.n-button {
  transition: all 0.2s ease;
}

.max-w-xl {
  max-width: 44rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.block {
  display: block;
}

.opacity-70 {
  opacity: 0.7;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 640px) {
  .max-w-xl {
    max-width: 100%;
  }
}
</style>
