import { createApp } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import App from './App.vue'
import './style.css'

gsap.registerPlugin(ScrollTrigger, Flip)

createApp(App).mount('#app')
