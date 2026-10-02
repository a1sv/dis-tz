import { createRouter, createWebHashHistory } from 'vue-router'
import { navGroups, titles } from '@/data/nav'

const opViews = import.meta.glob('../views/op/*.vue')
const mgrViews = import.meta.glob('../views/mgr/*.vue')

function buildRoutes() {
  const routes = []
  for (const role of ['op', 'mgr']) {
    const views = role === 'op' ? opViews : mgrViews
    const ids = navGroups[role].flatMap((g) => g.items.map((i) => i.id))
    for (const id of ids) {
      const loader = views[`../views/${role}/${id}.vue`]
      if (!loader) continue
      routes.push({
        path: `/${role}/${id}`,
        name: `${role}-${id}`,
        component: loader,
        meta: { ...(titles[role][id] || {}), role, id },
      })
    }
  }
  return routes
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/op/work' },
    ...buildRoutes(),
    { path: '/:pathMatch(.*)*', redirect: '/op/work' },
  ],
})

export default router