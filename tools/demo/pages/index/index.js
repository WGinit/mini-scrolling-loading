
const allList = Array.from({length: 10000}, (_, index) => {
    return {
        index: index + 1,
        id: index + 1
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

})
