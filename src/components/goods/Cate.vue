<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        class="tree-table"
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        :show-row-hover="false"
        border
      >
        <!-- 是否有效模板 -->
        <template slot="iosk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.catDeleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序模板 -->
        <template slot="sort" slot-scope="scope">
          <el-tag :type="sortRank[scope.row.catLevel].color" size="mini">
            {{ sortRank[scope.row.catLevel].rank }}</el-tag
          >
        </template>

        <!-- 操作模板 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <!-- page-sizes表示每页可以显示几条数据,绑定几个可选值 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%"
      @close="addCatedialogClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cateName">
          <el-input v-model="addCateForm.cateName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源  props指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              ...cascaderProps,
              checkStrictly: true,
              expandTrigger: 'hover',
            }"
            clearable
            @change="parentCateChanged"
          ></el-cascader
        ></el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateOk">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Axios from '../../common/utils/axios.js';

export default {

  data () {
    this.sortRank = [
      {
        color: 'primary',
        rank: '一级'
      }, {
        color: 'success',
        rank: '二级'
      }, {
        color: 'warning',
        rank: '三级'
      },
    ]
    return {
      // category接口查询参数
      queryInfo: {
        type: 3,              // 1，2，3所有层级
        pageSize: 2,          // 每页显示条数
        pageNum: 1            // 当前第几页
      },
      addCatedialogVisible: false,
      addCateForm: {
        cateName: '',          // 将要添加的分类名称
        catePid: 0,             // 父级分类的id（不能为空，如果添加1级分类，父分类的id应该设置0）
        cateLevel: 0            // 分类层级（不能为空，0表示1级，1表示2级，2表示3级）
      },                      // 添加分类的表单数据对象
      addCateFormRules: {     // 添加分类表单的验证规则对象
        cateName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      categoryList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'catName',
          width: '400px'
        },
        {
          label: '是否有效',
          prop: 'catDeleted',
          type: 'template',
          template: 'iosk'
        },
        {
          label: '排序',
          prop: 'catLevel',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        },
      ],
      selectedKeys: [],       // 被选中的级联每项的cateId数组
      parentCateList: [],     // 级联数据源父级分类列表
      cascaderProps: {        // 级联选择器的配置对象
        value: 'catId',
        label: 'catName',
        children: 'children'
      }
    }
  },
  created () {
    this.getCategoryLsit()
  },
  methods: {
    async getCategoryLsit () {
      let { data, meta } = await Axios.get('/categories', {
        params: this.queryInfo
      })
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.categoryList = data.result
      this.total = data.total
    },
    // 监听 pageSize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getCategoryLsit()
    },
    // 监听 pageNum 改变
    handleCurrentChange (newNum) {
      this.queryInfo.pageNum = newNum
      this.getCategoryLsit()
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },

    async getParentCateList () {
      let { data, meta } = await Axios.get('/categories', {
        params: { type: 2 }
      })
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.parentCateList = data.result
    },

    // 级联选择器的选择项变化触发的回调
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.catePid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cateLevel = this.selectedKeys.length
      } else {
        this.addCateForm.catePid = 0
        this.addCateForm.cateLevel = 0
      }
    },
    // 监听添加分类确定事件
    addCateOk () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { meta } = await Axios.post('/categories', this.addCateForm)
        if (meta.status != 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCategoryLsit()
        this.addCatedialogVisible = false
      })
    },
    // 监听添加分类取消事件
    addCateCancel () {
      this.addCatedialogVisible = false
    },
    // 监听对话框的关闭事件
    addCatedialogClose () {
      this.addCateForm.catePid = 0
      this.addCateForm.cateLevel = 0
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
    }

  }

}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>