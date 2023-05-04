export const muster = {
    scrollTop: 0, // 滚动位置距顶部距离
    startOffset: 0,
    startIndex: 0, // 起始项索引
    endIndex: 0, // 结束项索引
    endOffset: 0,
}

function isFunction(value) {
    return Object.prototype.toString.call(value) === '[object Function]'
}


function isNumber(obj) {  
    return Object.prototype.toString.call(obj) === '[object Number]' && !isNaN(obj)  
}


function styleToCssString(styles) {
    let str = ''
    for (let i in styles) {
        str += `${i}: ${styles[i]};`
    }
    return str
}


export const methods = {
    // 计算单Item高度
    itemSizeGetter: (itemSize) => { 
        return (index: number) => { 
            if (isFunction(itemSize)) { 
                return itemSize(index); 
            } 
            return Array.isArray(itemSize) ? itemSize[index] : itemSize; 
        }; 
    },

    getSizeAndPositionOfLastMeasuredItem() { 
        return this.lastMeasuredIndex >= 0 ? this.itemSizeAndPositionData[this.lastMeasuredIndex] : { offset: 0, size: 0 }; 
    },
    getTotalSize(): number { 
        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem(); 
        return ( lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size + (this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize ); 
    },
    getSizeAndPositionForIndex(index: number) {
        if (index > this.lastMeasuredIndex) {
          const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
          let offset =
            lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size;
    
          for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
            const size = this.itemSizeGetter(i);
            this.itemSizeAndPositionData[i] = {
              offset,
              size,
            };
    
            offset += size;
          }
    
          this.lastMeasuredIndex = index;
        }
    
        return this.itemSizeAndPositionData[index];
    },
    findNearestItem(offset: number) {
        offset = Math.max(0, offset);
    
        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
        const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);
    
        if (lastMeasuredSizeAndPosition.offset >= offset) {
          return this.binarySearch({
            high: lastMeasuredIndex,
            low: 0,
            offset,
          });
        } else {
          return this.exponentialSearch({
            index: lastMeasuredIndex,
            offset,
          });
        }
    },
    binarySearch({
        low,
        high,
        offset,
      }: {
        low: number;
        high: number;
        offset: number;
      }) {
        let middle = 0;
        let currentOffset = 0;
    
        while (low <= high) {
          middle = low + Math.floor((high - low) / 2);
          currentOffset = this.getSizeAndPositionForIndex(middle).offset;
    
          if (currentOffset === offset) {
            return middle;
          } else if (currentOffset < offset) {
            low = middle + 1;
          } else if (currentOffset > offset) {
            high = middle - 1;
          }
        }
    
        if (low > 0) {
          return low - 1;
        }
    
        return 0;
    },

    exponentialSearch({
        index,
        offset,
      }: {
        index: number;
        offset: number;
      }) {
        let interval = 1;
    
        while (
          index < this.itemCount &&
          this.getSizeAndPositionForIndex(index).offset < offset
        ) {
          index += interval;
          interval *= 2;
        }
    
        return this.binarySearch({
          high: Math.min(index, this.itemCount - 1),
          low: Math.floor(index / 2),
          offset,
        });
    },

    getVisibleRange({
        containerSize,
        offset,
        overscanCount,
      }: {
        containerSize: number;
        offset: number;
        overscanCount: number;
      }): { start?: number; stop?: number } {
        const maxOffset = offset + containerSize;
        let start = this.findNearestItem(offset);
    
        const datum = this.getSizeAndPositionForIndex(start);
        offset = datum.offset + datum.size;
    
        let stop = start;
    
        while (offset < maxOffset && stop < this.itemCount - 1) {
          stop++;
          offset += this.getSizeAndPositionForIndex(stop).size;
        }
    
        if (overscanCount) {
          start = Math.max(0, start - overscanCount);
          stop = Math.min(stop + overscanCount, this.itemCount - 1);
        }
    
        return {
          start,
          stop,
        };
    },

    getItemStyle(index) {
        const style = this.styleCache[index];
        if (style) {
          return style;
        }
        const { scrollDirection } = this.data;
        const {
          size,
          offset,
        } = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);
        const cumputedStyle = styleToCssString({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          [this.positionProp[scrollDirection]]: offset,
          [this.sizeProp[scrollDirection]]: size,
        });
        this.styleCache[index] = cumputedStyle;
        return cumputedStyle;
    },
    
    observeScroll(offset: number) {
        const { scrollDirection, overscanCount, visibleRange } = this.data;
        const { start, stop } = this.sizeAndPositionManager.getVisibleRange({
          containerSize: this.data[this.sizeProp[scrollDirection]] || 0,
          offset,
          overscanCount,
        });
        const totalSize = this.sizeAndPositionManager.getTotalSize();
  
        if (totalSize !== this.data.totalSize) {
          this.setData({ totalSize });
        }
  
        if (visibleRange.start !== start || visibleRange.stop !== stop) {
          const styleItems: string[] = [];
          if (isNumber(start) && isNumber(stop)) {
            let index = start - 1;
            while (++index <= stop) {
              styleItems.push(this.getItemStyle(index));
            }
          }
          this.triggerEvent('render', {
            startIndex: start,
            stopIndex: stop,
            styleItems,
          });
        }
  
        this.data.offset = offset;
        this.data.visibleRange.start = start;
        this.data.visibleRange.stop = stop;
    }  
    
}