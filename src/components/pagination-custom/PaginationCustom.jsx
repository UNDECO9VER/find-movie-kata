import React from 'react'
import {Pagination} from 'antd'

const PaginationCustom=({totalItems, page, onChange})=>{

  return(
    <React.Fragment>
      {totalItems > 0 
        ? <Pagination 
          className='pagination'
          defaultCurrent={1} 
          pageSize={20} 
          onChange={(e)=> onChange(e)} 
          current={page} 
          total={totalItems} 
          showSizeChanger={false}/> : null}
    </React.Fragment>
  )
}

export default PaginationCustom