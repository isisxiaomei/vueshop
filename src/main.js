import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/css/global.css";
import "./plugins/element.js";

import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)

import TreeTable from 'vue-table-with-tree-grid'
Vue.config.productionTip = false;
Vue.component('tree-table', TreeTable)





new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
