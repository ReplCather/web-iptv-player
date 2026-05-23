import {
  createApp
} from 'vue'
import './style.css'
import App from './App.vue'
import VideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import { createI18n } from './i18n/index.js'

// Video.js 8+ has built-in HLS support via VHS (Video.js HTTP Streaming)
// No need for videojs-contrib-hls which is deprecated

const app = createApp(App)
const i18n = createI18n()
app.use(VideoPlayer)
app.use(i18n)
app.mount('#app')
