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
        list: [],
        startIndex: 0,
        endIndex: 20,
        //  当前数据
        currentData: [],
        //  容器高度
        viewHeight: 0,
        //  每行的高度
        itemHeight: 45,
        //  每屏展示数据的条数
        showCount: 0,
        totalCount: 0
    },
    ready() {
        // this.counting().then(() => {
        //     this.getList()
        // }).catch(err => {
        //     console.log('获取盒子信息失败', err)
        // })
        this.counting()
        // this.getList()
    },
    lifetimes: {
        attached() {
            this.getData(() => {
                this.renderPage(0)
            })
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
            this.setData({
                page: 1,
                flag: false,
                loading: true,
                totalCount: 0
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
        },

         // 获取容器高度 ---- 设置showCount
        counting() {
            //   获取容器高度需要一点点时间，我们需要在获取到容器的高度之后再获取数据所以用了promise
            // return new Promise((resolve, reject) => {
            //     // const query = wx.createSelectorQuery()
            //     const query = this.createSelectorQuery()
            //     console.log('query==', query)
            //     query.select('#container').boundingClientRect(rect => {
            //         console.log('rect===', rect)
            //         if (rect) {
            //             const viewHeight = rect.height
            //             const showCount = Math.ceil(viewHeight / this.data.itemHeight)
            //             this.setData({
            //                 showCount
            //             })
            //             resolve(showCount)
            //         } else {
            //             reject(rect)
            //         }
            //     }).exec()
            // })

            const viewHeight = 750
            const showCount = Math.ceil(viewHeight / this.data.itemHeight)
            this.setData({
                showCount
            })
            console.log('showCount===', showCount)
        },
        // 获取数据
        getList() {
            const list = []

            for (let i = 1; i <= 20000; i++) {
                list.push(i)
            }
            this.setData({
                list
            })
            console.log('list==', list)
            this.renderPage(0)
        },
        renderPage(scrollTop) {
            //  根据scrollTop判断该展示哪一部分数据
            let startIndex = Math.floor(scrollTop / this.data.itemHeight)

            console.log('startIndex1111===', startIndex)
            //  showCount * 2 ---- 上滑速度太快造成的页面白屏
            let endIndex = startIndex + this.data.showCount * 2
            if (endIndex > this.data.totalCount) {
                endIndex = this.data.totalCount
            }

             //  将startIndex往前推也是为了解决下拉列表速度过快导致的白屏问题
             startIndex = startIndex <= this.data.showCount ? 0 : startIndex - this.data.showCount

            //  当前展示的数据
            const currentData = this.data.list.slice(startIndex, endIndex)

            console.log('startIndex===', startIndex)
            console.log('endIndex====', endIndex, currentData.length, this.data.totalCount)

            this.setData({
                startIndex,
                endIndex,
                currentData
            })
        },
        handleScroll: throttle(function (event) {
            const scrollTop = event.detail.scrollTop
            console.log('scrollTop===', scrollTop)
            this.renderPage(scrollTop)
        }, 300)
    },
})
