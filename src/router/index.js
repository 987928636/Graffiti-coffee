import Vue from 'vue'
import VueRouter from 'vue-router'
import {routes} from './routes'
Vue.use(VueRouter)

VueRouter.prototype.back = false;
VueRouter.prototype.goBack = function () {
      this.back = true;
      this.go(-1)
}

const router = new VueRouter({
  // 把路由抽离出去
  routes
})

export default router
