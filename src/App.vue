<template>
  <div id="app">
    <transition :name="transition">
      <router-view  class="view"/>
    </transition>
  </div>
</template>

<script>
export default {
  name: "app",
    data() {
        return {
            transition: "slide-left"
        };
    },
    watch: {
        $route (to, from ) {
            var back = this.$router.back;
            if (back) { //点击了返回
                this.transition = 'slide-right'
            }else{
                this.transition = 'slide-left'
            }
            this.$router.back = false;
        }
    }

}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.fl {
  float: left;
}
.fr {
  float: right;
}
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
.auto-img {
  width: 100%;
  display: block;
  clear: both;
}

.one-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



.view {
  // padding: 50px 300px;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  transition: all 0.3s linear;
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(100%, 0);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-100%, 0);
}    
</style>
