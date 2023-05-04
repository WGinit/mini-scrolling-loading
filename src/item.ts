
Component({
    properties: {
        item: Object
    },
    methods: {
        delItem(e) {
            const {index} = e.mark
            this.triggerEvent('delItem', index)
        }
    }
})
