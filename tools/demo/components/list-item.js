
Component({
    properties: {
        item: Object
    },
    methods: {
        delItems(e) {
            const { id } = e.mark
            console.log('del id==', id)
            wx.showModal({
                title: '提示',
                content: '确认删除吗',
                success: (res) => {
                    if (res.confirm) {
                        this.triggerEvent('delItem', { id})
                    }
                }
            })
        }
    },
})
