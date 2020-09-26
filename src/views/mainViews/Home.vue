<template>
  <div class="home">
    <div class="home-top">
      <van-nav-bar :fixed="true">
        <template #left>
          <div v-if="isLogin" class="home-title van-ellipsis">
            {{timeText}},
            <span class="username" @click="goMy">{{nickName}}</span>
          </div>
          <div v-else class="home-title">
            {{timeText}},
            <span class="username" @click="goLogin">登录</span>
          </div>
        </template>
        <template #right>
          <van-search placeholder="请输入商品名称" shape="round" @focus="gosearch" />
        </template>
      </van-nav-bar>

      <div class="banner-box">
        <van-swipe :autoplay="3000" indicator-color="#0C34BA">
          <van-swipe-item
            v-for="(item,index) in bannerList"
            :key="index"
            @click="viewProductInfo(item.pid)"
          >
            <van-image :src="item.bannerImg">
              <template v-slot:loading>
                <van-loading type="spinner" size="20" />
              </template>
            </van-image>
          </van-swipe-item>
        </van-swipe>
      </div>

      <div @click="changeMap" class="van-ellipsis adress-box">
        <van-icon name="location" size="24px" color="#0C34BA"></van-icon>
        <span>{{myadress}}</span>
        <span class="myadress-r">></span>
      </div>
      <!-- 地图开始 -->
      <div v-show="isMap">
        <el-autocomplete
          style="width:100%;"
          popper-class="autoAddressClass"
          v-model="form.address"
          :fetch-suggestions="querySearchAsync"
          :trigger-on-focus="false"
          placeholder="详细地址"
          @select="handleSelect"
          clearable
        >
          <template slot-scope="{ item }">
            <i class="el-icon-search fl mgr10"></i>
            <div style="overflow:hidden;">
              <div class="title">{{ item.title }}</div>
              <span class="address ellipsis">{{ item.address }}</span>
            </div>
          </template>
        </el-autocomplete>
        <div id="map-container" style="width:100%;height:300px;"></div>
        <!-- 地图结束 -->
      </div>

      <van-skeleton :row="6" :loading="isLoading">
        <div class="hot-product">
          <div class="hot-product-title">热门推荐</div>
          <div class="product-box clearfix">
            <van-tabs
              v-model="active"
              line-height="0"
              title-inactive-color="#000"
              title-active-color="#fff"
              scrollspy
              sticky
              background="#6a91ec"
            >
              <van-tab v-for="(item,index) in hotrList" :title="'周' + (index+1)" :key="index">
                <div class="pro-text" :class="{fl:index%2==0,fr:index%2!=0}">
                  <div>
                    <van-tag type="primary" size="large">{{item.name}}</van-tag>
                  </div>
                  <p class="hot-text">
                    <span>热度:</span>
                    <van-rate
                      v-model="item.id"
                      allow-half
                      icon="fire"
                      void-icon="fire-o"
                      readonly
                      size="15px"
                    />
                  </p>

                  <van-tag plain type="primary" size="medium">￥{{item.price}}</van-tag>
                </div>

                <van-image
                  class="hot-img"
                  :class="{fr:index%2==0,fl:index%2!=0}"
                  :src="item.smallImg"
                  width="4rem"
                  fit="contain"
                  @click="viewProductInfo(item.pid)"
                >
                  <template v-slot:loading>
                    <van-loading type="spinner" size="20" />
                  </template>
                </van-image>
              </van-tab>
            </van-tabs>
          </div>
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<script>
import "../../assets/less/home.less";
//在组件中引入loadBMap函数
import loadBMap from "../../assets/js/loadBMap.js";
export default {
  name: "Home",
  data() {
    return {
      active: 0, // 默认选中的tab页
      bannerList: [], // 轮播图
      hotrList: [], // 热门推荐
      isLoading: true, // 显示骨架
      timeText: "", // 时间
      nickName: "", // 用户昵称
      isLogin: false, // 用户是否登录

      //地图数据
      isMap: false,//是否显示地图
      myadress: "当前位置",//当前所选地址
      form: {
        address: "", //详细地址
        addrPoint: {
          //详细地址经纬度
          lng: 0,
          lat: 0,
        },
      },
      map: "", //地图实例
      mk: "", //Marker实例
    };
  },
  created() {
    this.getBanner(); //获取banner轮播图
    this.getHot(); //请求推荐商品数据
    this.getTime(); //获取时间段
    this.getMyinfo(); //获取账号登录信息
  },

  //这里运用async/await 进行异步处理，保证BMap加载进来后才执行后面的操作
  async mounted() {
    await loadBMap("v34VthV880rYnDrgWaUcCtvLl9k24EfM"); //加载引入BMap
    //调用初始化地图方法
    this.initMap();
  },

  methods: {
    // 初始化地图
    initMap() {
      var that = this;
      this.map = new BMap.Map("map-container", { enableMapClick: false }); //新建地图实例，enableMapClick:false ：禁用地图默认点击弹框
      var point = new BMap.Point(113.30765, 23.12005);
      this.map.centerAndZoom(point, 19);

      this.mk = new BMap.Marker(point, { enableDragging: true }); //创建一个图像标注实例，enableDragging：是否启用拖拽，默认为false
      this.map.addOverlay(this.mk); //将覆盖物添加到地图中

      this.mk.addEventListener("dragend", function (e) {
        that.getAddrByPoint(e.point); //拖拽结束后调用逆地址解析函数，e.point为拖拽后的地理坐标
      });

      var navigationControl = new BMap.NavigationControl({
        //创建一个特定样式的地图平移缩放控件
        anchor: BMAP_ANCHOR_TOP_RIGHT, //靠右上角位置
        type: BMAP_NAVIGATION_CONTROL_SMALL, //SMALL控件类型
      });
      this.map.addControl(navigationControl); //将控件添加到地图

      var geolocationControl = new BMap.GeolocationControl({
        anchor: BMAP_ANCHOR_BOTTOM_LEFT,
      }); //创建一个地图定位控件
      geolocationControl.addEventListener("locationSuccess", function (e) {
        //绑定定位成功后事件
        that.getAddrByPoint(e.point); //定位成功后调用逆地址解析函数
      });
      geolocationControl.addEventListener("locationError", function (e) {
        //绑定定位失败后事件
        // alert(e.message);
      });
      this.map.addControl(geolocationControl); //将控件添加到地图

      //调用浏览器定位
      this.geolocation();

      // 在地图上选取地址。点击地图上任意点，都将获取该点的地址信息。
      this.map.addEventListener("click", function (e) {
        //给地图绑定点击事件
        that.getAddrByPoint(e.point); //点击后调用逆地址解析函数
      });
    },

    //  * 逆地址解析函数（根据坐标点获取详细地址）
    //  * @param {Object} point   百度地图坐标点，必传
    getAddrByPoint(point) {
      var that = this;
      var geco = new BMap.Geocoder();
      geco.getLocation(point, function (res) {
        (res); //内容见下图
        that.myadress = res.address;
        that.mk.setPosition(point); //重新设置标注的地理坐标
        that.map.panTo(point); //将地图的中心点更改为给定的点
        that.form.address = res.address; //记录该点的详细地址信息
        that.form.addrPoint = point; //记录当前坐标点
      });
    },

    geolocation() {
      var that = this;
      var geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(
        function (res) {
          if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            that.getAddrByPoint(res.point); //当成功时，调用逆地址解析函数
            // alert("success" + this.getStatus());
          } else {
            // alert("failed" + this.getStatus()); //失败时，弹出失败状态码
          }
        },
        { enableHighAccuracy: true }
      ); //enableHighAccuracy：是否要求浏览器获取最佳效果，默认为false
    },

    // 定位搜索建议方法
    querySearchAsync(str, cb) {
      var options = {
        onSearchComplete: function (res) {
          //检索完成后的回调函数
          var s = [];
          if (local.getStatus() == BMAP_STATUS_SUCCESS) {
            for (var i = 0; i < res.getCurrentNumPois(); i++) {
              s.push(res.getPoi(i));
            }
            cb(s); //获取到数据时，通过回调函数cb返回到<el-autocomplete>组件中进行显示
          } else {
            cb(s);
          }
        },
      };
      var local = new BMap.LocalSearch(this.map, options); //创建LocalSearch构造函数
      local.search(str); //调用search方法，根据检索词str发起检索
    },

    // handleSelect：点击选中建议项时触发的方法
    handleSelect(item) {
      this.form.address = item.address + item.title; //记录详细地址，含建筑物名
      this.myadress = this.form.address;
      this.form.addrPoint = item.point; //记录当前选中地址坐标
      this.map.clearOverlays(); //清除地图上所有覆盖物
      this.mk = new BMap.Marker(item.point); //根据所选坐标重新创建Marker
      this.map.addOverlay(this.mk); //将覆盖物重新添加到地图中
      this.map.panTo(item.point); //将地图的中心点更改为选定坐标点
    },

    //显示地图
    changeMap() {
      this.isMap = !this.isMap;
    },

    //上拉刷新
    onRefresh() {
      setTimeout(() => {
        Toast("刷新成功");
        this.isLoading = false;
        this.count++;
      }, 1000);
    },

    //根据不同时间段，显示不同问候语
    getTime() {
      let hours = new Date().getHours();
      if (hours >= 5 && hours < 8) {
        this.timeText = "早上好";
      } else if (hours >= 8 && hours < 11) {
        this.timeText = "上午好";
      } else if (hours >= 11 && hours < 13) {
        this.timeText = "中午好";
      } else if (hours >= 13 && hours < 17) {
        this.timeText = "下午好";
      } else if (hours >= 17 && hours < 19) {
        this.timeText = "晚上好";
      } else if (hours >= 1 && hours < 5) {
        this.timeText = "凌晨好";
      } else {
        this.timeText = "深夜好";
      }
    },

    //获取banner轮播图
    getBanner() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/banner",
        params: {
          appkey: this.appkey,
        },
      })
        .then((result) => {
          this.$toast.clear();
          if (result.data.code == 300) {
            this.isLoading = false; //隐藏骨架
            this.bannerList = result.data.result;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //请求推荐商品数据
    getHot() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/typeProducts",
        params: {
          appkey: this.appkey,
          key: "isHot",
          value: 1,
        },
      })
        .then((result) => {
          this.$toast.clear();
          if (result.data.code == 500) {
            this.hotrList = result.data.result;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //获取账号信息
    getMyinfo() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      //如果没有token,显示为未登录状态
      if (!tokenString) {
        return;
        this.isLogin = false;
      }

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/findMy",
        params: {
          appkey: this.appkey,
          tokenString,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //如果请求成功,显示登录状态
          if (result.data.code == "A001") {
            this.nickName = result.data.result[0].nickName;
            this.isLogin = true;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //前往搜索页面
    gosearch() {
      this.$router.push({ name: "Search" });
    },

    //前往登录界面
    goLogin() {
      this.$dialog
        .confirm({
          message: "当前为未登录状态，是否前往登录页面？",
        })
        .then(() => {
          this.$router.push({ name: "Login" });
        })
        .catch(() => {
          // on cancel
        });
    },

    //前往我的界面
    goMy() {
      this.$router.push({ name: "My" });
    },

    //查看商品详情,携带商品id过去
    viewProductInfo(pid) {
      this.$router.push({ name: "Detail", query: { pid } });
    },
  },
};
</script>

<style lang="less">
</style>