import CreditsViewVue from "@/views/CreditsView/CreditsView.vue";
import ExperienceViewVue from "@/views/ExperienceView/ExperienceView.vue";
import HomeViewVue from "@/views/HomeView/HomeView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeViewVue,
    },
    {
      path: "/experience",
      name: "experience",
      // redirect: "/",
      component: ExperienceViewVue,
    },
    {
      path: "/credits",
      name: "credits",
      // redirect: "/",
      component: CreditsViewVue,
    },
  ],
});

export default router;
