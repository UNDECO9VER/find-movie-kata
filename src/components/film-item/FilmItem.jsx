import React, { Component } from 'react'
import {  Tag, Rate, Spin} from 'antd'
import { format, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import './FilmItem.css'
import { FilmGenresConsumer } from '../../context/film-genres-context/FilmGenresContext'

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

  ratingToColorConverter = (value) =>{
    switch(true){
    case value >= 0 && value <= 3: return '#E90000'
    case value > 3 && value <= 5: return '#E97E00'
    case value > 5 && value <= 7: return '#E9D100'
    case value > 7: return '#66E900'
    default: return 'black'
    }
  }

  getGenresName = (genres, filmGenres)=>{
    return filmGenres.map((id) => {
      for(const el of genres){
        if(id === el.id) return el.name
      }
    })
  }

  render(){
    const {title, posterPath, releaseDate, 
      voteAverage, overview, rating, 
      rateMovie, genreIds} = this.props
    const time = () => {
      try{
        return format(parseISO(releaseDate), 'MMM dd, yyyy')
      }
      catch{
        return null
      }
    }
    const color = this.ratingToColorConverter(voteAverage)
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
            <FilmGenresConsumer>
              {(genres)=>
                <div>
                  {this.getGenresName(genres, genreIds).map((item) =>
                    <Tag key={uuidv4()}>{item}</Tag>
                  )}
                </div>
              }
            </FilmGenresConsumer>
          </div>
          <span className='film-item__overview'>
            {this.stringCut(overview)}
          </span>
          <div className='film-item__rating' style={{borderColor: color}}>{voteAverage}</div>
          <Rate className='film-item__rate' onChange={(e) => rateMovie(this.props.filmId, e)} value={rating} count={10}/>
        </div>
      </div>
    )
  }
}