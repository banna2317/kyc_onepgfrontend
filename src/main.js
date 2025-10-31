import { createApp } from 'vue'
import App from './App.vue'
import router from './router'        // ✅ Router import
import './style.css'                 // ✅ Tailwind styles
import { createPinia } from 'pinia'
// ✅ Import Toast plugin
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'  // ✅ Toast styles

// ✅ Create and configure app
const app = createApp(App)

// ✅ Register plugins
app.use(router)
app.use(createPinia())
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
})

// ✅ Mount app
app.mount('#app')
