import {throttle} from './util'

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
            value: '100vh'
        },
        itemHeight: {
            type: Number,
            value: 40
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
        list: [],
        startIndex: 0,
        endIndex: 20,
        showData: [],
        viewHeight: 0,
        itemHeight: 45,
        showCount: 0,
        totalCount: 0,
        scrollTop: 0
    },
    ready() {
        this.initBox().then(() => {
            this.getData(() => {
                this.conputePage(0)
            })
        }).catch(err => {
            console.log('获取容器高度失败', err)
        })
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
                    this.triggerEvent('delSuccess')
                }
                this.data.list = list
                const total = list.length
                this.setData({
                    totalCount: total,
                    loading
                }, () => {
                    this.data.flag = false
                    if (typeof cb === 'function') {
                        cb(res)
                    }
                })
            }).catch(err => {
                this.triggerEvent('apiError', err)
            })
        },

        upper() {
            if (!this.data.enUpper) return
            this.data.list = []
            this.data.scrollTop = 0
            this.setData({
                page: 1,
                flag: false,
                loading: true,
                showData: [],
                totalCount: 0
            }, this.getData)
        },
        lower() {
            this.data.page++
            this.getData()
        },

        deleteItem(e: {
            detail: {
                index: number;
                id: number | string
            }
        }) {
            const {id} = e.detail
            const {
                list,
                perpage,
                idKey
            } = this.data
            const index = list.findIndex(item => item[idKey] === id)
            const currentPage = Math.ceil(index / perpage)
            list.splice(index, 1)
            this.data.page = currentPage
            this.data.list = list
            this.getData(() => {
                this.conputePage(this.data.scrollTop)
            }, true)
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
        },

        initBox() {
            return new Promise((resolve, reject) => {
                const query = this.createSelectorQuery()
                query.select('#container').boundingClientRect(rect => {
                    if (rect) {
                        const viewHeight = rect.height
                        const showCount = Math.ceil(viewHeight / this.data.itemHeight)
                        this.setData({
                            showCount
                        })
                        resolve(showCount)
                    } else {
                        reject(rect)
                    }
                }).exec()
            })
        },
        conputePage(scrollTop) {
            this.data.scrollTop = scrollTop
            let startIndex = Math.floor(scrollTop / this.data.itemHeight)
            let endIndex = startIndex + this.data.showCount * 2
            if (endIndex > this.data.totalCount) {
                endIndex = this.data.totalCount
            }
            startIndex = startIndex <= this.data.showCount ? 0 : startIndex - this.data.showCount
            const showData = this.data.list.slice(startIndex, endIndex)
            this.setData({
                startIndex,
                endIndex,
                showData
            })
        },
        handleScroll: throttle(function (event) {
            const scrollTop = event.detail.scrollTop
            this.conputePage(scrollTop)
        }, 300)
    },
})
