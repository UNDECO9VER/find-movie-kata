import React, { Component } from 'react'
import { Rate, Spin} from 'antd'
import { format, parseISO } from 'date-fns'
import './FilmItem.css'

import FilmRating from '../film-rating/FilmRating'
import FilmGenres from '../film-genres/FilmGenres'

export default class FilmItem extends Component{

  state ={
    loaded: false
  }

  stringCut(str){
    if(str.length > 350){
      let subStr = str.substr(0,349)
      while(subStr[subStr.length-1] !== ' '){
        subStr = str.substr(0,subStr.length-1)
      }
      subStr = str.substr(0,subStr.length-1)
      return subStr +'...'
    }else return str
  }



  getGenresName = (genres, filmGenres)=>{
    return filmGenres.map((id) => {
      for(const el of genres){
        if(id === el.id) return el.name
      }
    })
  }

  render(){
    const {title, posterPath, releaseDate, overview, rating, 
      rateMovie, genreIds, voteAverage} = this.props
    const time = () => {
      try{
        return format(parseISO(releaseDate), 'MMM dd, yyyy')
      }
      catch{
        return null
      }
    }
    const imgPath = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : ''
    return(
      <div className='film-item'>
        <div className='film-item__img'>
          {!this.state.loaded && <Spin size="large" style={{position: 'absolute', top: '50%', left: '50%'}}/>}
          <img src={imgPath} style={this.state.loaded ? {} : {display: 'none'}} onError={()=> this.setState({loaded: true})} onLoad={()=> this.setState({loaded: true})}/> 
        </div>
        <div className='film-item__content'>
          <div className='film-item__header'>
            <h2 className='film-item__title'>{title}</h2>
            <span>{time()}</span>
            <FilmGenres genreIds={genreIds}/>
          </div>
          <span className='film-item__overview'>
            {this.stringCut(overview)}
          </span>
          <FilmRating sx={{position: 'absolute', right: 10, top: 10}}  voteAverage={voteAverage}/>
          <Rate className='film-item__rate' onChange={(e) => rateMovie(this.props.filmId, e)} value={rating} count={10}/>
        </div>
      </div>
    )
  }
}