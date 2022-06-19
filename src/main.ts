import { createPinia } from "pinia";
import { createApp } from "vue";
import { useSeedGame } from "./stores/SeedGame.store";
import App from "./App.vue";
import Experience from "./webgl/Experience";

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);

app.mount("#app");
