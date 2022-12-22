import {  Tag } from 'antd'
import { useContext } from 'react'

import FilmGenresContext from '../../context/film-genres-context/FilmGenresContext'

const FilmGenres =({genreIds})=> {

  const genres = useContext(FilmGenresContext)

  const getGenresName = (filmGenres)=>{
    return filmGenres.map((id) => {
      for(const el of genres){
        if(id === el.id) return el.name
      }
    })
  }

  return(
    <div>
      {getGenresName(genreIds).map((item) =>
        <Tag key={item}>{item}</Tag>
      )}
    </div>
  )
}

export default FilmGenres