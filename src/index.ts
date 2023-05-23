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
        resKey: {
            type: String,
            value: 'data'
        },
        idKey: {
            type: String,
            value: 'id'
        },
        totalKey: {
            type: String,
            value: 'total',
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
        },
        sprops: {
            type: Object,
            value: {}
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
        scrollTop: 0,
        listLength: 0
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
                flag, loading, perpageKey, query, resKey, totalKey
            } = this.data
            if (flag || !loading) return
            const params = {
                page: this.data.page,
                [`${perpageKey}`]: this.data.perpage,
                ...query
            }
            this.data.flag = true
            const _resKey = resKey.split('.')
            const _totalKey = totalKey.split('.')
            this.data.api(params).then(res => {
                let listItem = null
                _resKey.forEach(key => {
                    if (!listItem) {
                        listItem = res[key]
                    } else {
                        listItem = listItem[key]
                    }
                })
                console.log('data===', listItem)

                let {list} = this.data
                list = [...list, ...listItem]
                const loading = listItem.length === this.data.perpage
                if (delaySet) {
                    list = this.duplicateRemoval(list)
                    this.triggerEvent('delSuccess')
                }
                this.data.list = list
                let _total = null
                _totalKey.forEach(key => {
                    if (!_total) {
                        _total = res[key]
                    } else {
                        _total = _total[key]
                    }
                })
                const listLength = list.length
                this.triggerEvent('success', {
                    totalCount: _total,
                    data: listItem
                })
                this.setData({
                    totalCount: _total,
                    loading,
                    listLength
                }, () => {
                    this.data.flag = false
                    if (typeof cb === 'function') {
                        cb(listItem)
                    }
                })
            }).catch(err => {
                this.triggerEvent('error', err)
            })
        },

        refreshData() {
            this.data.page = 1
            this.setData({
                flag: false,
                loading: true,
                list: [],
                showData: [],
                startIndex: 0,
                endIndex: 20,
                scrollTop: 0,
                totalCount: 0,
            }, () => {
                this.getData(() => {
                    this.conputePage(0)
                })
            })
        },


        getResData() {
            return this.data.list
        },

        getResTotal() {
            return this.data.totalCount
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
        conputePage(scrollTop = 0) {
            this.data.scrollTop = scrollTop
            let startIndex = Math.floor(scrollTop / this.data.itemHeight)
            let endIndex = startIndex + this.data.showCount * 2
            if (endIndex > this.data.list.length) {
                endIndex = this.data.list.length
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
        }, 300),

        sEvent(e) {
            this.triggerEvent('sEvent', e.detail)
        }
    },
})
