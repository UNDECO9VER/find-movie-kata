import { Component } from 'react'

import './FilmFindForm.css'

export default class FilmFindForm extends Component {

  render(){
    const {searchValue, setSearchValue} = this.props

    return(
      <input 
        placeholder='Type to search...' 
        className='film-find'
        value={searchValue}
        onChange={setSearchValue}
      />
    )
  }
}