<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-alert
        title="注意只允许为第三级分类设置参数"
        type="warning"
        closable
        show-icon
      >
      </el-alert>

      <!-- 商品分类选择区域 -->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- options用来指定数据源  props指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="categoryList"
            :props="{
              ...cascaderProps,
              checkStrictly: true,
              expandTrigger: 'hover',
            }"
            clearable
            @change="cateChanged"
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 动态静态tab属性区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="showAddParamDialog = true"
            >添加参数</el-button
          >
          <el-table :data="manyTableList" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="success"
                  closable
                  @close="handleCloseTag(index, scope.row)"
                  v-for="(item, index) of scope.row.attrVals"
                  :key="index"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attrName" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="modifyParamClick(scope.row.attrId)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParamClick"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="showAddAttrDialog = true"
            >添加属性</el-button
          >
          <el-table :data="onlyTableList" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attrName" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                  >修改</el-button
                >
                <el-button type="danger" icon="el-icon-delete" size="mini"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数对话框 -->
      <base-dialog
        :dialogVisible="showAddParamDialog"
        :title="addParamDialogTitle"
        @cancel-dialog="addParamDialogCancel"
        @ok-dialog="addParamDialogOk"
      >
        <el-form
          ref="addParamFormRef"
          :model="addParamForm"
          :rules="addParamFormRules"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="attrName">
            <el-input v-model="addParamForm.attrName"></el-input>
          </el-form-item>
        </el-form>
      </base-dialog>

      <!-- 添加属性对话框 -->
      <base-dialog
        :dialogVisible="showAddAttrDialog"
        :title="addAttrDialogTitle"
        @cancel-dialog="addAttrDialogCancel"
        @ok-dialog="addAttrDialogOk"
      >
        <el-form
          ref="addAttrFormRef"
          :model="addAttrForm"
          :rules="addAttrFormRules"
          label-width="80px"
        >
          <el-form-item label="属性名称" prop="attrName">
            <el-input v-model="addAttrForm.attrName"></el-input>
          </el-form-item>
        </el-form>
      </base-dialog>

      <!-- 修改参数对话框 -->
      <base-dialog
        :dialogVisible="showModifyParamDialog"
        :title="modifyParamDialogTitle"
        @cancel-dialog="modifyParamDialogCancel"
        @ok-dialog="modifyParamDialogOk()"
      >
        <el-form
          ref="modifyParamFormRef"
          :model="modifyParamForm"
          :rules="modifyParamFormRules"
          label-width="80px"
        >
          <el-form-item label="动态参数" prop="attrName">
            <el-input v-model="modifyParamForm.attrName"></el-input>
          </el-form-item>
        </el-form>
      </base-dialog>
    </el-card>
  </div>
</template>

<script>
import Axios from '../../common/utils/axios.js';
import BaseDialog from '../../base/basecomponents/dialog.vue';
export default {
  data () {
    return {
      categoryList: [],       // 所有等级分类列表
      selectedKeys: [],       // 级联被选中项的cateId数组
      cascaderProps: {
        value: 'catId',
        label: 'catName',
        children: 'children'
      },                      // 级联配置对象
      activeName: 'many',     // 当前活跃tab
      manyTableList: [],      // 动态参数tabs列表
      onlyTableList: [],      // 静态属性tabs列表
      showAddParamDialog: false,    //
      showAddAttrDialog: false,     //
      addParamDialogTitle: '添加动态参数',
      addAttrDialogTitle: '添加静态属性',
      addParamForm: {
        attrName: ''
      },
      addAttrForm: {
        attrName: ''
      },
      addAttrFormRules: {
        attrName: [
          { required: true, message: '请输入属性名称', trigger: 'blur' }
        ]
      },
      addParamFormRules: {
        attrName: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      showModifyParamDialog: false,
      modifyParamDialogTitle: '修改动态参数',
      modifyParamForm: {
        attrName: ''
      },                                    // 修改对话框的表单数据源
      modifyParamFormRules: {
        attrName: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      deleteParamForm: {
        attrName: ''
      },
    }
  },
  computed: {
    // 没有选中3级分类，则按钮被禁用
    isBtnDisable () {
      return this.selectedKeys.length == 3 ? false : true
    },
    // 被选中的项的第3级cateId值
    cateId () {
      return this.selectedKeys.length == 3 ? this.selectedKeys[this.selectedKeys.length - 1] : null
    }
  },
  components: {
    BaseDialog
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取级联数据列表
    async getCateList () {
      let { data, meta } = await Axios.get('/categories')
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.categoryList = data.result
    },
    // 获取tabs属性列表
    async getParamsData () {
      if (this.selectedKeys.length !== 3) {
        this.manyTableList = []
        this.onlyTableList = []
        return this.selectedKeys.length = 0
      }
      let { data, meta } = await Axios.get(`/categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      data.forEach(item => {
        item.attrVals = item.attrVals.split(' ')
        // 为每一项提供各自的 控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      });
      if (this.activeName === 'many') return this.manyTableList = data
      return this.onlyTableList = data
    },

    // 级联选择框选中项变化触发的回调
    cateChanged () {
      this.getParamsData()
    },

    // tabs切换触发的回调
    handleTabClick () {
      this.getParamsData()
    },


    addParamDialogCancel () {
      this.showAddParamDialog = false
      this.$refs.addParamFormRef.resetFields()
    },

    addAttrDialogCancel () {
      this.showAddAttrDialog = false
      this.$refs.addAttrFormRef.resetFields()
    },

    // 添加参数ok的回调
    addParamDialogOk () {
      this.$refs.addParamFormRef.validate(async (valid) => {
        if (!valid) return
        let { meta } = await Axios.post(`/categories/${this.cateId}/attributes`, {
          params: {
            attrName: this.addParamForm.attrName,
            attrSel: this.activeName
          }
        })
        if (meta && meta.status !== 201) return this.$message.error(meta.msg)
        this.$message.success(meta.msg)

        this.showAddParamDialog = false
      })
    },

    // 添加属性ok的回调
    addAttrDialogOk () {
      this.$refs.addAttrFormRef.validate(async (valid) => {
        if (!valid) return
        let { meta } = await Axios.post(`/categories/${this.cateId}/attributes`, {
          params: {
            attrName: this.addAttrForm.attrName,
            attrSel: this.activeName
          }
        })
        if (meta && meta.status !== 201) return this.$message.error(meta.msg)
        this.$message.success(meta.msg)
        this.getParamsData()
        this.showAddAttrDialog = false
      })
    },
    // 修改按钮触发回调
    async modifyParamClick (attrId) {
      let { data, meta } = await Axios.get(`/categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attrSel: this.activeName
        }
      })
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.modifyParamForm = data
      this.showModifyParamDialog = true
    },
    // 删除按钮触发回调
    deleteParamClick () {

    },
    // 修改参数对话框取消触发的事件回调
    modifyParamDialogCancel () {
      this.$refs.modifyParamFormRef.resetFields()
      this.showModifyParamDialog = false
    },
    // 修改参数对话框确定触发的事件回调
    async modifyParamDialogOk () {
      this.$refs.modifyParamFormRef.validate(async (valid) => {
        if (!valid) return
        let { meta } = await Axios.put(`/categories/${this.cateId}/attributes/${this.modifyParamForm.attrId}`, {
          params: {
            attrName: this.modifyParamForm.attrName,
            attrSel: this.activeName
          }
        })
        if (meta && meta.status !== 200) return this.$message.error(meta.msg)
        this.getParamsData()
        this.showModifyParamDialog = false
      })
    },

    handleInputConfirm (row) {
      let inputValue = row.inputValue;
      if (inputValue) {
        row.attrVals.push(inputValue);
      }
      row.inputVisible = false;
      row.inputValue = '';
    },

    showInput (row) {
      row.inputVisible = true
      // 自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleCloseTag (index, row) {
      row.attrVals.splice(index, 1)
      // this.getParamsData()
    }
  }


}
</script>

<style lang="less" scoped>
.cat-opt {
  margin-top: 15px;
}
.el-table {
  margin-top: 15px;
}
.input-new-tag {
  width: 100px;
}
</style>