
Component({
    options: {
        multipleSlots: true
    },
    externalClasses: ['custom-class'],
    properties: {
        page: {
            type: Number,
            value: 1
        },
        perpage: {
            type: Number,
            value: 10
        },
        perpageKey: {
            type: String,
            value: 'perpage'
        },
        idKey: {
            type: String,
            value: 'id'
        },
        query: {
            type: Object,
            value: {}
        },
        height: {
            type: String,
            value: '300rpx'
        },
        api: {
            type: Function as any,
            value: async () => {}
        },
        enUpper: {
            type: Boolean,
            value: false
        }
    },
    data: {
        flag: false,
        loading: true,
        list: []
    },
    lifetimes: {
        attached() {
            this.getData()
        }
    },
    methods: {
        getData(cb: Function, delaySet: Boolean) {
            const {
                flag, loading, perpageKey, query
            } = this.data
            if (flag || !loading) return
            const params = {
                page: this.data.page,
                [`${perpageKey}`]: this.data.perpage,
                ...query
            }
            this.data.flag = true
            this.data.api(params).then(res => {
                let {list} = this.data
                list = [...list, ...res]
                const loading = res.length === this.data.perpage
                if (delaySet) {
                    list = this.duplicateRemoval(list)
                }
                if (typeof cb === 'function') {
                    cb(res)
                }
                this.setData({
                    list,
                    loading
                }, () => {
                    this.data.flag = false
                })
            }).catch(err => {
                this.triggerEvent('apiError', err)
            })
        },

        upper() {
            if (!this.data.enUpper) return
            this.setData({
                page: 1,
                flag: false,
                loading: true,
                list: []
            }, this.getData)
        },
        lower() {
            this.data.page++
            this.getData()
        },

        deleteItem(e: {
            detail: number
        }) {
            const index = e.detail
            const {list, perpage} = this.data
            const currentPage = Math.ceil(index / perpage)
            list.splice(index)
            this.data.page = currentPage
            this.data.list = list
            this.getData(null, true)
        },
        // 去重
        duplicateRemoval(list) {
            const tempValue = []
            const tempList = []
            for (const item of list) {
                const value = item[this.data.idKey]
                if (!tempValue.includes(value)) {
                    tempValue.push(value)
                    tempList.push(item)
                }
            }
            return tempList
        }
    },
})
