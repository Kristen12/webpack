import "./assets/index.css";
import "./assets/index.less";
console.log("kristen");
let a = "abc";
console.log(a);
// var promise = new Promise();
// console.log(promise);

import Vue from "vue";
import App from "./app";
new Vue({
  render: h => h(App)
}).$mount("#app");
