<template>
  <div class="menu">
    <van-search placeholder="请输入商品名称" shape="round" :fixed="true" @focus="gosearch" />
    <div class="banner-box">
      <van-swipe :autoplay="3000" indicator-color="#0C34BA">
        <van-swipe-item v-for="(item,index) in swiperData" :key="index">
          <img class="auto-img" :src="item" />
        </van-swipe-item>
      </van-swipe>
    </div>
    <!-- tab切换栏 -->
    <div class="menu-box">
      <van-tabs v-model="active" animated line-height="0" title-active-color="#0b34ba">
        <van-tab v-for="(item,index) in typeData" :key="index">
          <template #title>
            <img
              class="auto-img"
              @click="toggleType(item)"
              v-lazy="item.isActive ? item.activeIcon : item.icon"
              alt
            />
            {{item.typeDesc}}
          </template>
          <!-- 内容区 -->
          <div class="menu-list">
            <van-skeleton :row="6" :loading="isLoading">
              <van-card
                centered
                v-for="(item,index) in products"
                tag="hot"
                :price="item.price"
                :desc="item.enname"
                :title="item.name"
                :key="index"
                lazy-load
              >
                <template #thumb>
                  <img :src="item.smallImg" class="auto-img" alt @click="goProductInfo(item.pid)" />
                </template>
                <template #num>
                  <van-button
                    size="small"
                    color="#0b34ba"
                    icon="cart"
                    round
                    type="default"
                    @click="viewProductInfo(item.pid)"
                  >加入购物车</van-button>
                </template>
                <template #tags>
                  <van-tag plain type="danger">{{item.typeDesc}}</van-tag>
                </template>
              </van-card>
            </van-skeleton>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-popup v-model="show" round position="bottom" :style="{ height: '60%' }" closeable>
      <div class="shop-title">商品详情</div>
      <!-- 商品详细信息 -->
      <div class="detail-info">
        <div class="rule-box">
          <div class="rule-item clearfix" v-for="(item, index) in product.rules" :key="index">
            <div class="fl rule-item-title">{{item.title}}</div>
            <div class="fl clearfix">
              <div
                class="fl rule-item-tag"
                :class="{active: v.isActive}"
                v-for="(v, i) in item.rules"
                :key="i"
                @click="toggleRule(v, index)"
              >{{v.title}}</div>
            </div>
          </div>
        </div>
        <!-- 商品描述 -->
        <div class="desc-box">
          <div class="desc-title">商品描述</div>
          <div class="desc-content">
            <div
              class="desc-text"
              v-for="(item, index) in product.desc"
              :key="index"
            >{{index + 1}}、{{item}}</div>
          </div>
        </div>
        <!-- 商品价格和数量 -->
        <div class="clearfix desc-price-count">
          <div class="fl price">￥{{product.price * count}}</div>
          <div class="fr count">
            <van-stepper v-model="count" theme="round" button-size="24" disable-input />
          </div>
        </div>
      </div>
      <!-- 底部商品导航 -->
      <van-goods-action>
        <van-goods-action-icon
          icon="like"
          text="收藏"
          :color="isLike ? '#0C34BA' : '#999'"
          @click="likeAndNotLike"
        />
        <van-goods-action-button color="#6A91EC" text="确定" @click="addShopbag" />
      </van-goods-action>
    </van-popup>
  </div>
</template>

<script>
import "../../assets/less/menu.less";
import { utils } from "../../assets/js/utils";

export default {
  name: "Menu",
  data() {
    return {
      count: 1, // 商品数量默认为1
      pid: "", // 传入的商品id
      product: {}, // 商品详情数据
      isLike: false, // 商品收藏与否

      show: false, // 是否显示商品详情
      active: 0, // 默认选中的tab页面
      typeData: [], // 商品类型数据
      products: [], // 商品各类型对应的数据
      isLoading: true, // 是否显示骨架屏
      // 自定义轮播图图片
      swiperData: [
        "https://s1.luckincoffeecdn.com/luckywaprm/media/banner-1-7.65fc8fe7.jpg",
        "https://s1.luckincoffeecdn.com/luckywaprm/media/other_img_p4.35e0898e.jpg",
        "https://s1.luckincoffeecdn.com/luckywaprm/media/banner_02@2x.69c29356.jpg",
        "https://s1.luckincoffeecdn.com/luckywaprm/media/banner-3-2.4dd55a8c.jpg",
      ],
    };
  },

  created() {
    //获取商品类型数据
    this.getTypeData();
    //查询商品是否被收藏
    this.findLike();
  },

  methods: {
    //获取商品类型数据
    getTypeData() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/type",
        params: {
          appkey: this.appkey,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //如果请求数据成功
          if (result.data.code == 400) {
            //给每个商品类型自定义图标
            let iconData = [
              {
                type: "latte",
                icon: require("../../assets/images/icons_05.gif"),
                activeIcon: require("../../assets/images/icons_19.gif"),
              },
              {
                type: "coffee",
                icon: require("../../assets/images/icons_03.gif"),
                activeIcon: require("../../assets/images/icons_18.gif"),
              },
              {
                type: "rena_ice",
                icon: require("../../assets/images/icons_07.gif"),
                activeIcon: require("../../assets/images/icons_20.gif"),
              },
            ];

            //遍历请求到的数据,根据type匹配添加新属性
            result.data.result.map((v) => {
              for (let i = 0; i < iconData.length; i++) {
                if (v.type == iconData[i].type) {
                  v.icon = iconData[i].icon;
                  v.activeIcon = iconData[i].activeIcon;
                  v.isActive = false;
                  break;
                }
              }
            });

            //在数组前面添加推荐对象
            result.data.result.unshift({
              type: "isHot",
              typeDesc: "推荐",
              icon: require("../../assets/images/icons_09.gif"),
              activeIcon: require("../../assets/images/icons_21.gif"),
              isActive: true,
            });
            //将处理好的数据赋值给商品类型数组
            this.typeData = result.data.result;
            //根据商品类型获取商品数据
            this.getProductsByType(this.typeData[0]);
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //切换商品类型
    toggleType(item) {
      if (item.isActive) {
        return;
      }
      //显示骨架屏
      this.isLoading = true;

      for (let i = 0; i < this.typeData.length; i++) {
        if (this.typeData[i].isActive) {
          this.typeData[i].isActive = false;
          break;
        }
      }
      item.isActive = true;
      //根据商品类型获取商品数据
      this.getProductsByType(item);
    },

    //根据商品类型获取商品数据
    getProductsByType(item) {
      //初始化商品数据
      this.products = [];
      //如果存在缓存数据,则在缓存获取商品数据,不发起请求
      let data = sessionStorage.getItem(item.type);
      if (data) {
        this.isLoading = false; //隐藏骨架屏
        this.products = JSON.parse(data);
        return;
      }

      let params = {
        key: "type",
        value: item.type,
        appkey: this.appkey,
      };

      if (item.type == "isHot") {
        params.key = "isHot";
        params.value = 1;
      }

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/typeProducts",
        params,
      })
        .then((result) => {
          this.$toast.clear();
          //请求数据成功
          if (result.data.code == 500) {
            this.isLoading = false; //隐藏骨架屏
            this.products = result.data.result;
            //将商品数据进行缓存
            sessionStorage.setItem(item.type, JSON.stringify(this.products));
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //根据商品pid获取商品数据
    getProductByPid() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/productDetail",
        params: {
          appkey: this.appkey,
          pid: this.pid,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //请求数据成功
          if (result.data.code == 600) {
            //处理商品描述数据
            //将字符串以换行符分割成字符串数组。
            result.data.result[0].desc = result.data.result[0].desc.split(/\n/);
            //需要将商品规格数据处理成如下
            /**
             * [
                {
                  title: '温度',
                  rules: [
                    {
                      title: '热',
                      isActive: false
                    }
                  ]
                }
              ]
            */
            let ruleItems = ["tem", "sugar", "cream", "milk"];
            let rulesData = [];
            ruleItems.map((v) => {
              // 如果匹配到的属性为空，则return
              if (result.data.result[0][v] == "") {
                return;
              }

              let rule = {
                title: result.data.result[0][v + "_desc"],
                rules: [],
              };

              // 将全糖/半糖 分割成字符串数组。
              let r = result.data.result[0][v].split("/");

              r.map((value, index) => {
                let o = {
                  title: value,
                  isActive: index == 0, //默认第一个商品规格选中
                };
                //将分割好的规格数据追加到rules空数组里
                rule.rules.push(o);
              });
              // 将处理好的商品规格对象追加到空数组里
              rulesData.push(rule);
            });
            // 将数组赋值给当前商品详情的规格
            result.data.result[0].rules = rulesData;
            // 重新初始化商品详情数据
            this.product = result.data.result[0];
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //切换商品规格
    toggleRule(v, index) {
      //如果当前规格是选中状态,则return
      if (v.isActive) {
        return;
      }
      // 获取到当前商品规格的数组
      let ruleData = this.product.rules[index].rules;
      //遍历数组,取消全部规格的选中状态
      for (let i = 0; i < ruleData.length; i++) {
        if (ruleData[i].isActive) {
          ruleData[i].isActive = false;
          break;
        }
      }
      //当前点击的商品规格改为选中状态
      v.isActive = true;
    },

    //加入购物袋
    addShopbag() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        this.$dialog
          .confirm({
            message: "当前操作需要登录才能进行，是否立即前往登录页面",
          })
          .then(() => {
            this.$router.push({ name: "Login" });
          })
          .catch(() => {
            // on cancel
          });
      }

      //获取当前商品选择的规格
      let rules = this.product.rules;
      let rule = [];
      //匹配当前选中的商品规格
      rules.map((v) => {
        for (let i = 0; i < v.rules.length; i++) {
          if (v.rules[i].isActive) {
            rule.push(v.rules[i].title);
            break;
          }
        }
      });

      //序列化参数
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        pid: this.pid,
        count: this.count,
        rule: rule.join("/"), //将数组转换成字符串
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/addShopcart",
        data,
      })
        .then((result) => {
          this.$toast.clear();
          //请求成功
          if (result.data.code == 3000) {
            this.$toast.success(result.data.msg);
            //如果status==1,则商品的购物车的商品数量增加1
            if (result.data.status == 1) {
              this.bagCount++;
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //查询商品是否被收藏
    findLike() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      //如果用户没有登录则不查询
      if (!tokenString) {
        return;
      }

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "GET",
        url: "/findlike",
        params: {
          appkey: this.appkey,
          tokenString,
          pid: this.pid,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //查询收藏商品成功
          if (result.data.code == 1000) {
            //如果收藏的数组长度不为0
            if (result.data.result.length != 0) {
              //当前收藏状态改为true
              this.isLike = true;
            } else {
              this.isLike = false;
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //点击收藏图标,收藏商品
    likeAndNotLike() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");

      //对传进来的参数进行序列化处理
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        pid: this.pid,
      });

      //根据this.isLike请求不同的接口
      //如果当前状态为收藏状态再请求取消收藏接口,否则反之
      let url = this.isLike ? "/notlike" : "/like";

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url,
        data,
      })
        .then((result) => {
          this.$toast.clear();
          //如果未登录状态,则跳转到登录页面
          if (result.data.code == 700) {
            this.$dialog
              .confirm({
                message: "当前操作需要登录才能进行，是否立即前往登录页面",
              })
              .then(() => {
                this.$router.push({ name: "Login" });
              })
              .catch(() => {
                // on cancel
              });
          }

          //如果当前商品未收藏
          if (result.data.code == 800) {
            //改为收藏状态
            this.isLike = true;
          } else if (result.data.code == 900) {
            // 取消收藏
            this.isLike = false;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //点击商品图片前往商品详情页面,携带商品的pid
    goProductInfo(pid) {
      this.$router.push({ name: "Detail", query: { pid } });
    },

    //点击右侧加入购物车按钮,弹出商品详情
    viewProductInfo(pid) {
      this.show = true; //显示popup弹出层
      this.pid = pid; // 获取传递过来的商品pid
      this.getProductByPid(); //调用获取商品数据方法
      this.findLike(); //调用查看是否收藏方法
    },

    //前往搜索页面
    gosearch() {
      this.$router.push({ name: "Search" });
    },
  },
};
</script>

