
const allList = Array.from({length: 10000}, (_, index) => {
    return {
        index: index + 1,
        id: Math.ceil(Math.random(1) * 10000)
    }
})

Page({
    data: {
        getData: (params) => {
            return new Promise((resolve, reject) => {
                let length = params.perpage
                const res = allList.slice((params.page - 1) * params.perpage, params.page * params.perpage)

                console.log('res===', res)
                setTimeout(() => {
                    resolve(res)
                }, 500);
            })
        }
    },


    delSuccess() {
        console.log('del-success')
    }

})
