import Vue from 'vue'

import axios from 'axios'
import VueAxios from 'vue-axios'

import App from './App.vue'
import router from './router'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);


// 导入vant组件
import {
  NavBar, Form, Field, Button, Icon, Popup, Tabbar, TabbarItem, Toast, Notify, Swipe,
  SwipeItem,
  Search,
  Lazyload,
  Tab,
  Tabs,
  Skeleton,
  Card,
  Tag,
  GoodsAction,
  GoodsActionIcon,
  GoodsActionButton,
  Stepper,
  Image as VanImage,
  Loading,
  Empty,
  SwipeCell,
  Checkbox, 
  CheckboxGroup,
  SubmitBar,
  Rate,
  Dialog,
  AddressList,
  AddressEdit,
  Sticky,
  Cell,
  Uploader,
  Collapse,
  CollapseItem,
  Divider,
  PullRefresh,
  CouponCell,
  CouponList   
} from 'vant';


// 调用vant组件
Vue
  .use(NavBar)
  .use(Form)
  .use(Field)
  .use(Button)
  .use(Icon)
  .use(Popup)
  .use(Tabbar)
  .use(TabbarItem)
  .use(Toast)
  .use(Notify)
  .use(Swipe)
  .use(SwipeItem)
  .use(Search)
  .use(Lazyload)
  .use(Tab)
  .use(Tabs)
  .use(Skeleton)
  .use(Card)
  .use(Tag)
  .use(GoodsAction)
  .use(GoodsActionIcon)
  .use(GoodsActionButton)
  .use(Stepper)
  .use(VanImage)
  .use(Loading)
  .use(Empty)
  .use(SwipeCell)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(SubmitBar)
  .use(Rate)
  .use(Dialog)
  .use(AddressList)
  .use(AddressEdit)
  .use(Sticky)
  .use(Cell)
  .use(Uploader)
  .use(Collapse)
  .use(CollapseItem)
  .use(Divider)
  .use(PullRefresh)
  .use(CouponCell)
  .use(CouponList)


//注册axios, ajax方案，用于请求数据
Vue.use(VueAxios, axios)
//设置post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
// 配置请求基础路径
axios.defaults.baseURL = 'http://www.kangliuyong.com:10002'
// 添加一个Vue原型属性
Vue.prototype.appkey = 'U2FsdGVkX19WSQ59Cg+Fj9jNZPxRC5y0xB1iV06BeNA='

import "lib-flexible/flexible"

Vue.config.productionTip = false

//全局注册过滤器, 一般用于格式化数据
Vue.filter('formatDate', (value, format) => {
  //value: 需要格式化的数据
  //format: 指定格式 yyyy-MM-dd hh:mm:ss

  //  

  let date = new Date(value);

  //获取年份
  let year = date.getFullYear();
  //  
  if (/(y+)/.test(format)) {
    //获取匹配组的内容
    let content = RegExp.$1;
    //  
    format = format.replace(content, year.toString().slice(4 - content.length));

    //  
  }

  let o = {
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds()
  };

  for (let key in o) {
    //构造动态正则
    let reg = new RegExp(`(${key}+)`);
    //  
    if (reg.test(format)) {
      //获取匹配组的内容
      let content = RegExp.$1;
      //  
      let k =  o[key] >= 10 ? o[key] : content.length == 2 ? '0' + o[key] : o[key];
      //  
      format = format.replace(content, k);
      //  
    }
  }

  return format;
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
