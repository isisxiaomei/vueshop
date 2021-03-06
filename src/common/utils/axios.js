import Axios from 'axios';
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'


const instance = Axios.create({
  baseURL: 'https://www.fastmock.site/mock/ec506369e4e21894afac3bd163cea378/api',
});

instance.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config;
}, error => {
  return Promise.reject(error);
});

instance.interceptors.response.use(response => {
  NProgress.done();
  return response.data;
}, error => {
  return Promise.reject(error);
});

export default instance