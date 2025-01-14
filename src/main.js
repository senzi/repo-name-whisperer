import { createApp } from 'vue'
import App from './App.vue'
import {
  create,
  NButton,
  NCard,
  NConfigProvider,
  NForm,
  NFormItem,
  NH1,
  NH2,
  NH3,
  NIcon,
  NInput,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NMessageProvider,
  NSpace,
  NText
} from 'naive-ui'
import './style.css'

const naive = create({
  components: [
    NButton,
    NCard,
    NConfigProvider,
    NForm,
    NFormItem,
    NH1,
    NH2,
    NH3,
    NIcon,
    NInput,
    NLayout,
    NLayoutContent,
    NLayoutHeader,
    NMessageProvider,
    NSpace,
    NText
  ]
})

createApp(App).use(naive).mount('#app')
